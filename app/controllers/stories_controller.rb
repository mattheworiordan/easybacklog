class StoriesController < ApplicationController
  before_filter :authenticate_user!, :set_theme_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy, :move_to_theme]

  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      @stories = @theme.stories.find(:all, :include => [:acceptance_criteria])
      render :json => @stories.to_json(:include => [:acceptance_criteria], :methods => [:score])
    end
  end

  def show
    @story = @theme.stories.find(params[:id])
    enforce_can :read, 'You do not have permission to view this backlog' do
      render :json => @story.to_json(:methods => [:score])
    end
  end

  def new
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @story = @theme.stories.new
      render :json => @story.to_json(:methods => [:score])
    end
  end

  def create
    enforce_can :full, 'You do not have permission to edit this backlog' do
      config_score_params params
      @story = @theme.stories.new(safe_story_params)
      if @story.save
        render :json => story_json
      else
        send_json_error @theme.errors.full_messages.join(', ')
      end
    end
  end

  def update
    config_score_params params
    @story = @theme.stories.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @story.update_attributes safe_story_params
      if @story.save
        render :json => story_json
      else
        send_json_error @story.errors.full_messages.join(', ')
      end
    end
  end

  # move a story to a new theme
  def move_to_theme
    @story = @theme.stories.find(params[:id])
    new_theme = Theme.find(params[:new_theme_id])

    enforce_can :full, 'You do not have permission to edit this backlog' do
      @story.move_to_theme new_theme
      render :json => story_json
    end
  rescue Exception => e
    send_json_error "Server error trying to move theme #{e}"
  end

  def destroy
    @story = @theme.stories.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @story.destroy
      send_json_notice "Story deleted", :score_statistics => @theme.score_statistics(:force => true)
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
      if @theme.backlog.account.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this story'
        redirect_to accounts_path
      end
    end

    def story_json()
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
      @theme.backlog.update_meta_data current_user
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_json_error message
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

    def safe_story_params
      safe_params :theme_id, :cost_formatted, :days_formatted, :sprint_story_status_id, :sprint_story_id, :score_statistics
    end
end