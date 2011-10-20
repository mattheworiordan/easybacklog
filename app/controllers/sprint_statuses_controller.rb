class SprintStatusesController < ApplicationController
  before_filter :authenticate_user!

  def index
    @sprint_statuses = SprintStatus.all
    render :json => @sprint_statuses
  end
end