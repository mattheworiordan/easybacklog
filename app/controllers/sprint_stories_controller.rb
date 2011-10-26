class SprintStoriesController < ApplicationController
  before_filter :authenticate_user!, :set_sprint_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]

  METHODS = [:theme_id, :sprint_statistics]

  def index
    @sprint_stories = @sprint.sprint_stories.find(:all)
    render :json => @sprint_stories.to_json(:methods => METHODS)
  end

  def show
    @sprint_story = @sprint.sprint_stories.find(params[:id])
    render :json => @sprint_story.to_json(:methods => METHODS)
  end

  def create
    @sprint_story = @sprint.sprint_stories.new(params)
    @sprint_story.sprint_id = params[:sprint_id]
    @sprint_story.story_id = params[:story_id]
    if @sprint_story.save
      render :json => @sprint_story.to_json(:methods => METHODS)
    else
      send_json_error @sprint_story.errors.full_messages.join(', ')
    end
  end

  def update
    @sprint_story = @sprint.sprint_stories.find(params[:id])
    @sprint_story.update_attributes params
    if @sprint_story.save
      render :json => @sprint_story.to_json(:methods => METHODS)
    else
      send_json_error @sprint_story.errors.full_messages.join(', ')
    end
  end

  def destroy
    begin
      @sprint_story = @sprint.sprint_stories.find(params[:id])
      @sprint_story.destroy
      send_json_notice "Sprint story removed from sprint", :sprint_statistics => {
        :total_expected_points => @sprint.total_expected_points,
        :total_completed_points => @sprint.total_completed_points,
        :total_allocated_points => @sprint.total_allocated_points
      }
    rescue ActiveRecord::RecordNotFound
      send_json_notice "Sprint story was not found and is likely deleted"
    end
  end

  private
    # set the @sprint instance variable from nested oute
    # ensure user has access to this based on account
    def set_sprint_and_protect
      @sprint = Sprint.find(params[:sprint_id])
      if @sprint.backlog.account.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this sprint story'
        redirect_to accounts_path
      end
    end

    def update_backlog_metadata
      @sprint.backlog.update_meta_data current_user
    end
end