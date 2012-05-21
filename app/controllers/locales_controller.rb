class LocalesController < ApplicationController
  respond_to :xml, :json

  ## included in API
  def index
    respond_with Locale.all
  end

  ## included in API
  def show
    respond_with Locale.find(params[:id])
  end
end