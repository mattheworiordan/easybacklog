class StoriesController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api, :authenticate_user!, :set_theme_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy, :move_to_theme]
  before_filter :stop_updates_if_locked, :only => [:create, :update, :destroy]

  ## included in API
  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      if params[:include_associated_data].to_s == 'true'
        @stories = @theme.stories.find(:all, :include => [:acceptance_criteria])
        @stories = @stories.as_json(:include => [:acceptance_criteria], :methods => [:score], :except => [:created_at, :updated_at])
      else
        @stories = @theme.stories
      end
      respond_with @stories
    end
  end

  ## included in API
  def show
    find_params = params[:include_associated_data] ? { :include => [:acceptance_criteria] } : {}
    @story = @theme.stories.find(params[:id], find_params)
    enforce_can :read, 'You do not have permission to view this backlog' do
      if !is_api?
        render :json => @story.to_json(:methods => [:score], :except => [:created_at, :updated_at])
      else
        render request.format.to_sym => if params[:include_associated_data].to_s == 'true'
          @story.as_json(:include => [:acceptance_criteria])
        else
          @story
        end
      end
    end
  end

  ## included in API
  def create
    enforce_can :full, 'You do not have permission to create this story' do
      config_score_params params
      @story = @theme.stories.new(filter_story_params)
      if @story.save
        if is_api?
          render request.format.to_sym => @story, :status => STATUS_CODE[:created]
        else
          render request.format.to_sym => frontend_json # include stats in response object
        end
      else
        send_error @story, :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def update
    config_score_params params
    @story = @theme.stories.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      if @story.update_attributes filter_story_params
        @story.ensure_send_statistics if params[:force_send_statistics] # allow stats to be force sent with this update, needed when a story is moved to a new theme
        if is_api?
          respond_with @story
        else
          render request.format.to_sym => frontend_json # include stats in response object, and force response of object even though with updates that's not normally required
        end
      else
        send_error @story, :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def destroy
    @story = @theme.stories.find(params[:id])
    enforce_can :full, 'You do not have permission to delete this story' do
      @story.destroy
      if is_api?
        respond_with @story
      else
        send_notice "Story deleted", :score_statistics => @theme.score_statistics(:force => true)
      end
    end
  end

  # move a story to a new theme
  ## included in API
  def move_to_theme
    @story = @theme.stories.find(params[:id])
    new_theme = Theme.find(params[:new_theme_id])

    if new_theme.backlog == @theme.backlog then
      enforce_can :full, 'You do not have permission to edit this backlog' do
        begin
          @story.move_to_theme new_theme
          if is_api?
            render :nothing => true, :status => STATUS_CODE[:no_content]
          else
            render :json => frontend_json
          end
        rescue Exception => e
          send_error "Server error trying to move theme #{e}", :http_status => :internal_server_error
        end
      end
    else
      send_error "You cannot move a story to a theme in a different backlog", :http_status => :forbidden
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    (@story || @theme).can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    # set the @theme instance variable from nested oute
    # ensure user has access to this based on account
    def set_theme_and_protect
      @theme = Theme.find(params[:theme_id])
      if @theme.backlog.account.users.find_by_id(current_user.id).blank?
        send_error 'You do not have permission to view this story', :http_status => :forbidden, :redirect_to => accounts_path
      end
    end

    def stop_updates_if_locked
      send_error 'This story cannot be updated as the backlog is not editable', :http_status => :forbidden unless @theme.editable?
    end

    def frontend_json()
      story_methods = if @story.theme.backlog.cost_estimatable?
        [:score_statistics, :cost_formatted, :days_formatted, :score]
      elsif @story.theme.backlog.days_estimatable?
        [:score_statistics, :days_formatted, :score]
      else
        [:score_statistics, :score]
      end
      @story.to_json(:methods => story_methods, :except => [:updated_at, :created_at])
    end

    def update_backlog_metadata
      @theme.backlog.update_meta_data current_user if @story.present? && @story.errors.blank? && @theme.backlog.editable?
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_error message, :http_status => :forbidden
      end
    end

    # depending on whether we are using the 50/90 rule or the straight scoring system
    # we need to remove unnecessary params as updates can conflict i.e. updating score
    # will in turn update the 50/90 values
    def config_score_params(params)
      # if we're not using the 50/90 method, ignore the 50/90 values as they are set by score
      if params.include?(:score) && !@theme.backlog.use_50_90?
        params.delete(:score_50)
        params.delete(:score_90)
      else
        params.delete(:score)
      end
    end

    def filter_story_params
      filter_params :theme_id, :cost_formatted, :days_formatted, :sprint_story_status_id, :sprint_story_id, :score_statistics, :force_send_statistics, :meta_filtered, :meta_collapsed, :created_at, :updated_at
    end
end