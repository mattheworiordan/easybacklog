class StoriesController < ApplicationController
  before_filter :authenticate_user!, :set_theme_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy, :move_to_theme]
  ssl_required :index, :show, :new, :create, :update, :move_to_theme, :destroy if use_ssl?

  def index
    @stories = @theme.stories.find(:all, :include => [:acceptance_criteria])
    render :json => @stories.to_json(:include => [:acceptance_criteria])
  end

  def show
    @story = @theme.stories.find(params[:id])
    render :json => @story
  end

  def new
    @story = @theme.stories.new
    render :json => @story
  end

  def create
    @story = @theme.stories.new(params)
    if @story.save
      render :json => story_json
    else
      send_json_error @theme.errors.full_messages.join(', ')
    end
  end

  def update
    @story = @theme.stories.find(params[:id])
    @story.update_attributes params
    if @story.save
      render :json => story_json
    else
      send_json_error @story.errors.full_messages.join(', ')
    end
  end

  # move a story to a new theme
  def move_to_theme
    @story = @theme.stories.find(params[:id])
    new_theme = Theme.find(params[:new_theme_id])

    # ensure unique ID is empty first as we will need to assign a new one
    @story.unique_id = nil
    # assign to new theme, note: using new_theme.stories << self failed
    new_theme.stories << @story
    # now move to last item
    @story.move_to_bottom

    render :json => story_json
  rescue Exception => e
    send_json_error "Server error trying to move theme #{e}"
  end

  def destroy
    @story = @theme.stories.find(params[:id])
    @story.destroy
    send_json_notice "Story deleted", :score_statistics => @theme.score_statistics(:force => true)
  end

  private
    # set the @theme instance variable from nested oute
    # ensure user has access to this based on company
    def set_theme_and_protect
      @theme = Theme.find(params[:theme_id])
      if @theme.backlog.company.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this story'
        redirect_to companies_path
      end
    end

    def story_json()
      @story.to_json(:methods => [:score_statistics, :cost_formatted, :days_formatted], :except => [:updated_at, :created_at])
    end

    def update_backlog_metadata
      @theme.backlog.update_meta_data current_user
    end
end