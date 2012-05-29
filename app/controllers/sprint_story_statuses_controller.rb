class SprintStoryStatusesController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api

  ## included in API
  def index
    respond_with SprintStoryStatus.all
  end

  ## included in API
  def show
    respond_with SprintStoryStatus.find(params[:id])
  end
end