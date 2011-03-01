class StoriesController < ApplicationController
  before_filter :authenticate_user!, :set_theme_and_protect

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
      render :json => @story
    else
      send_json_error @theme.errors.full_messages.join(', ')
    end
  end

  def update
    @story = @theme.stories.find(params[:id])
    @story.update_attributes params
    if @story.save
      render :json => @story
    else
      send_json_error @story.errors.full_messages.join(', ')
    end
  end

  def destroy
    @story = @theme.stories.find(params[:id])
    @story.destroy
    send_json_notice "Story deleted"
  end

  private
    # set the @company instance variable from nested oute
    # ensure user has access to this company
    def set_theme_and_protect
      @theme = Theme.find(params[:theme_id])
      if @theme.backlog.company.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this story'
        redirect_to companies_path
      end
    end
end