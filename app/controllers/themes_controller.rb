class ThemesController < ApplicationController
  before_filter :authenticate_user!, :set_backlog_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]

  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      @themes = @backlog.themes.find(:all, :include => [:stories, { :stories => :acceptance_criteria } ])
      render :json => @themes.to_json(:include => { :stories => { :include => :acceptance_criteria } })
    end
  end

  def show
    @theme = @backlog.themes.find(params[:id])
    enforce_can :read, 'You do not have permission to view this backlog' do
      render :json => @theme
    end
  end

  def new
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @theme = @backlog.themes.new
      render :json => @theme
    end
  end

  def create
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @theme = @backlog.themes.new(safe_theme_params)
      if @theme.save
        render :json => themes_json
      else
        send_json_error @theme.errors.full_messages.join(', ')
      end
    end
  end

  def update
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @theme.update_attributes safe_theme_params
      if @theme.save
        render :json => themes_json
      else
        send_json_error @theme.errors.full_messages.join(', ')
      end
    end
  end

  def destroy
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @theme.destroy
      send_json_notice 'Theme deleted', :score_statistics => @backlog.score_statistics(:force => true)
    end
  end

  def re_number_stories
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      begin
        @theme.re_number_stories
      rescue Theme::StoriesCannotBeRenumbered => e
        send_json_error 'Stories which are marked as done cannot be re-numbered'
      else
        send_json_notice 'Stories re-numbered'
      end
    end
  end

  def add_existing_story
    @theme = @backlog.themes.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      begin
        @story = @theme.backlog.themes.map { |t| t.stories.find { |s| s.id.to_s == params[:story_id] } }.compact.first
        if @story.blank?
          send_json_error 'Internal error. Could not find the story to be moved.  Please refresh your browser'
        else
          @theme.add_existing_story @story
          send_json_notice 'Story moved'
        end
      rescue Exception => e
        send_json_error "Internal error: '#{e.message}'.  Please refresh your browser."
      end
    end
  end

  def move_to_backlog
    enforce_can :full, 'You do not have permission to edit this backlog' do
      begin
        @theme = @backlog.themes.find(params[:id])
        @target_backlog = @backlog.account.backlogs.find(params[:target_backlog_id])
        if @target_backlog.can? :full, current_user
          @theme.move_to_backlog @target_backlog
          @backlog.reload
          send_json_notice "Theme moved", :score_statistics => @backlog.score_statistics(:force => true)
        else
          send_json_error "You do not have permission to add themes to the target backlog"
        end
      rescue Theme::ThemeCannotBeMoved => e
        send_json_error "This theme cannot be moved"
      rescue Exception => e
        send_json_error "Internal error: '#{e.message}'.  Please refresh your browser."
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
      @backlog = Backlog.find(params[:backlog_id])
      if @backlog.account.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this theme'
        redirect_to accounts_path
      end
    end

    def themes_json()
      @theme.to_json(:methods => [:score_statistics], :except => [:updated_at, :created_at])
    end

    def update_backlog_metadata
      @backlog.update_meta_data current_user
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_json_error message
      end
    end

    def safe_theme_params
      safe_params :backlog_id, :score_statistics, :theme_id, :points, :cost_formatted, :days
    end
end