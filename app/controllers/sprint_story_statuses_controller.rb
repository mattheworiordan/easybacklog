class SprintStoryStatusesController < ApplicationController
  before_filter :authenticate_user!

  def index
    @sprint_story_statuses = SprintStoryStatus.all
    render :json => @sprint_story_statuses
  end
end