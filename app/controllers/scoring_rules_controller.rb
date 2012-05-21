class ScoringRulesController < ApplicationController
  respond_to :xml, :json

  ## included in API
  def index
    respond_with ScoringRule.all
  end

  ## included in API
  def show
    respond_with ScoringRule.find(params[:id])
  end
end