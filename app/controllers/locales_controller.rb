class LocalesController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api

  ## included in API
  def index
    respond_with Locale.all
  end

  ## included in API
  def show
    respond_with Locale.find(params[:id])
  end
end