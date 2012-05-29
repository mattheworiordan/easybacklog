class ScoringRulesController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api

  ## included in API
  def index
    respond_with ScoringRule.all
  end

  ## included in API
  def show
    respond_with ScoringRule.find(params[:id])
  end
end