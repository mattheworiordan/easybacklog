class ThemesController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api, :authenticate_user!, :set_backlog_and_protect
  before_filter :stop_updates_if_locked, :only => [:create, :update, :destroy]
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]

  ## included in API
  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      if params[:include_associated_data].to_s == 'true'
        @themes = @backlog.themes.find(:all, :include => [:stories, { :stories => :acceptance_criteria } ])
        @themes = @themes.as_json(:include => { :stories => { :include => :acceptance_criteria } })
      else
        @themes = @backlog.themes
      end

      respond_with @themes
    end
  end

  ## included in API
  def show
    find_params = params[:include_associated_data] ? { :include => [:stories, { :stories => :acceptance_criteria } ] } : {}
    @theme = @backlog.themes.find(params[:id], find_params)
    enforce_can :read, 'You do not have permission to view this backlog' do
      render request.format.to_sym => if params[:include_associated_data].to_s == 'true'
        @theme.as_json(:include => { :stories => { :include => :acceptance_criteria } })
      else
        @theme
      end
    end
  end

  ## included in API
  def create
    enforce_can :full, 'You do not have permission to create this theme' do
      @theme = @backlog.themes.new(filter_theme_params)
      if @theme.save
        if is_api?
          render request.format.to_sym => @theme, :status => STATUS_CODE[:created]
        else
          render request.format.to_sym => frontend_json # include stats in response object
        end
      else
        send_error @theme, :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def update
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      if @theme.update_attributes filter_theme_params
        if is_api?
          respond_with @theme
        else
          render request.format.to_sym => frontend_json # include stats in response object, and force response of object even though with updates that's not normally required
        end
      else
        send_error @theme, :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def destroy
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to delete this theme' do
      @theme.destroy
      if is_api?
        respond_with @theme
      else
        send_notice 'Theme deleted', :score_statistics => @backlog.score_statistics(:force => true)
      end
    end
  end

  def re_number_stories
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      begin
        @theme.re_number_stories
      rescue Theme::StoriesCannotBeRenumbered => e
        send_error 'Stories which are marked as accepted cannot be re-numbered', :http_status => :forbidden
      else
        send_notice 'Stories re-numbered'
      end
    end
  end

  ## included in API
  def add_existing_story
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      begin
        @story = @theme.backlog.themes.map { |t| t.stories.find { |s| s.id.to_s == params[:story_id] } }.compact.first
        if @story.blank?
          send_error "Story to be moved does not exist", :http_status => :not_found
        else
          @theme.add_existing_story @story
          if is_api?
            render :nothing => true, :status => STATUS_CODE[:no_content]
          else
            send_notice 'Story moved'
          end
        end
      rescue Exception => e
        send_error "Internal error: '#{e.message}'. #{t 'refresh'}", :http_status => :internal_server_error
      end
    end
  end

  ## included in API
  def move_to_backlog
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @theme = @backlog.themes.find(params[:id])
      begin
        @target_backlog = @backlog.account.backlogs.find(params[:target_backlog_id])
        if @target_backlog.can? :full, current_user
          @theme.move_to_backlog @target_backlog
          if is_api?
            render :nothing => true, :status => STATUS_CODE[:no_content]
          else
            @backlog.reload
            send_notice "Theme moved", :score_statistics => @backlog.score_statistics(:force => true)
          end
        else
          send_error "You do not have permission to add themes to the target backlog", :http_status => :forbidden
        end
      rescue ActiveRecord::RecordNotFound => not_found
        send_error "The backlog you are moving this theme to does not exist", :http_status => :not_found
      rescue Theme::ThemeCannotBeMoved => e
        send_error "This theme cannot be moved. #{e.message}", :http_status => :forbidden
      rescue Exception => e
        send_error "Internal error: '#{e.message}'. #{t 'refresh'}", :http_status => :internal_server_error
      end
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    (@theme || @backlog).can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    # set the @backlog instance variable from nested route
    # ensure user has access to this based on account
    def set_backlog_and_protect
      begin
        @backlog = Backlog.find(params[:backlog_id])
        if @backlog.account.users.find_by_id(current_user.id).blank?
          send_error 'You do not have permission to view this theme', :http_status => :forbidden
        end
      rescue ActiveRecord::RecordNotFound => not_found
        send_error "Backlog with ID #{params[:backlog_id]} does not exist", :http_status => :not_found
      end
    end

    def frontend_json()
      @theme.as_json(:methods => [:score_statistics], :except => [:updated_at, :created_at])
    end

    def update_backlog_metadata
      @backlog.update_meta_data current_user if @theme.present? && @theme.errors.blank? && @backlog.editable?
    end

    def stop_updates_if_locked
      send_error 'This theme cannot be updated as the backlog is not editable', :http_status => :forbidden unless @backlog.editable?
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_error message, :http_status => :forbidden
      end
    end

    def filter_theme_params
      filter_params :backlog_id, :score_statistics, :theme_id, :points, :cost_formatted, :days
    end
end