class AcceptanceCriteriaController < ApplicationController
  before_filter :authenticate_user!, :set_theme_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]

  def index
    @acceptance_criteria = @story.acceptance_criteria.all
    render :json => @acceptance_criteria.to_json()
  end

  def show
    @acceptance_criteria = @story.acceptance_criteria.all
    render :json => @acceptance_criteria
  end

  def new
    @acceptance_criteria = @story.acceptance_criteria.new
    render :json => @acceptance_criteria
  end

  def create
    @acceptance_criteria = @story.acceptance_criteria.new(params)
    if @acceptance_criteria.save
      render :json => @acceptance_criteria
    else
      send_json_error @acceptance_criteria.errors.full_messages.join(', ')
    end
  end

  def update
    @acceptance_criteria = @story.acceptance_criteria.find(params[:id])
    @acceptance_criteria.update_attributes params
    if @acceptance_criteria.save
      render :json => @acceptance_criteria
    else
      send_json_error @acceptance_criteria.errors.full_messages.join(', ')
    end
  end

  def destroy
    @acceptance_criteria = @story.acceptance_criteria.find(params[:id])
    @acceptance_criteria.destroy
    send_json_notice "Acceptance Criterion deleted"
  end

  private
    # set the @story instance variable from nested route
    # ensure user has access to this based on account
    def set_theme_and_protect
      @story = Story.find(params[:story_id])
      if @story.theme.backlog.account.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this acceptance criterion'
        redirect_to accounts_path
      end
    end

    def update_backlog_metadata
      @acceptance_criteria.story.theme.backlog.update_meta_data current_user
    end
end