class AcceptanceCriteriaController < ApplicationController
  before_filter :authenticate_user!, :set_story_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]
  before_filter :stop_updates_if_locked, :only => [:create, :update, :destroy]

  respond_to :xml, :json

  ## included in API
  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      @acceptance_criteria = @story.acceptance_criteria.all
      respond_with @acceptance_criteria
    end
  end

  ## included in API
  def show
    @acceptance_criterion = @story.acceptance_criteria.find(params[:id])
    enforce_can :read, 'You do not have permission to view this backlog' do
      respond_with @acceptance_criterion
    end
  end

  ## included in API
  def create
    enforce_can :full, 'You do not have permission to create this acceptance criterion' do
      @acceptance_criterion = @story.acceptance_criteria.new(filter_criteria_params)
      if @acceptance_criterion.save
        respond_with @acceptance_criterion, :location => story_acceptance_criteria_path(@story, @acceptance_criterion)
      else
        send_error @acceptance_criterion.errors.full_messages.join(', '), :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def update
    @acceptance_criterion = @story.acceptance_criteria.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @acceptance_criterion.update_attributes filter_criteria_params
      if @acceptance_criterion.save
        if is_api?
          respond_with @acceptance_criterion
        else
          render request.format.to_sym => @acceptance_criterion
        end
      else
        send_error @acceptance_criterion.errors.full_messages.join(', '), :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def destroy
    @acceptance_criterion = @story.acceptance_criteria.find(params[:id])
    enforce_can :full, 'You do not have permission to delete this acceptance criterion' do
      @acceptance_criterion.destroy
      if is_api?
        respond_with @acceptance_criterion
      else
        send_notice "Acceptance Criterion deleted"
      end
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    (@acceptance_criterion || @story).can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    # set the @story instance variable from nested route
    # ensure user has access to this based on account
    def set_story_and_protect
      @story = Story.find(params[:story_id])
      if @story.theme.backlog.account.users.find_by_id(current_user.id).blank?
        send_error 'You do not have permission to view this acceptance criterion', :http_status => :forbidden, :redirect_to => accounts_path
      end
    end

    def stop_updates_if_locked
      send_error 'This acceptance criterion cannot be updated as the backlog is not editable', :http_status => :forbidden unless @story.editable?
    end

    def update_backlog_metadata
      @acceptance_criterion.story.theme.backlog.update_meta_data current_user if @acceptance_criterion.present? && @acceptance_criterion.errors.blank? && @acceptance_criterion.backlog.editable?
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_error message, :http_status => :forbidden
      end
    end

    def filter_criteria_params
      filter_params :story_id
    end
end