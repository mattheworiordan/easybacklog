class SprintStoryStatusesController < ApplicationController
  respond_to :xml, :json

  ## included in API
  def index
    respond_with SprintStoryStatus.all
  end

  ## included in API
  def show
    respond_with SprintStoryStatus.find(params[:id])
  end
end