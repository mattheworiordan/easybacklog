class SprintsController < ApplicationController
  before_filter :authenticate_user!, :set_backlog_and_protect
  SPRINT_METHODS = [:completed?, :deletable?, :total_allocated_points, :total_expected_points, :total_completed_points]
  EXCLUDE_FIELDS = [:updated_at, :created_at]

  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      @sprints = @backlog.sprints.find(:all, :include => { :sprint_stories => :story })
      render :json => @sprints.to_json(:include => {
        :sprint_stories =>
          { :only => [:id, :story_id, :sprint_story_status_id, :position], :methods => :theme_id }
        },
        :methods => SPRINT_METHODS,
        :except => EXCLUDE_FIELDS)
    end
  end

  def show
    @sprint = @backlog.sprints.find(params[:id])
    enforce_can :read, 'You do not have permission to view this backlog' do
      render :json => @sprint.to_json(:methods => SPRINT_METHODS, :except => EXCLUDE_FIELDS)
    end
  end

  def create
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @sprint = @backlog.sprints.new(params.select { |key,val| [:start_on, :duration_days, :explicit_velocity, :number_team_members].include?(key.to_sym) })
      if @sprint.save
        update_backlog_metadata
        render :json => @sprint.to_json(:methods => SPRINT_METHODS, :except => EXCLUDE_FIELDS)
      else
        send_json_error @sprint.errors.full_messages.join(', ')
      end
    end
  end

  def update
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @sprint = @backlog.sprints.find(params[:id])

      # changing completed is exclusive, no other updates will occur at the same time
      if (%w(true false).include? params[:completed])
        begin
        # special params set by front end to mark as completed or incomplete which can throw an error
          @sprint.mark_as_complete if params[:completed] == 'true'
          @sprint.mark_as_incomplete if params[:completed] == 'false'
        rescue Exception => e
          send_json_error e.message
        else
          update_backlog_metadata
          render :json => @sprint.to_json(:methods => SPRINT_METHODS, :except => EXCLUDE_FIELDS)
        end
      else
        @sprint.update_attributes filter_params(:backlog_id, :iteration, *SPRINT_METHODS)
        if @sprint.save
          update_backlog_metadata
          render :json => @sprint.to_json(:methods => SPRINT_METHODS, :except => EXCLUDE_FIELDS)
        else
          send_json_error @sprint.errors.full_messages.join(', ')
        end
      end
    end
  end

  def destroy
    @sprint = @backlog.sprints.find(params[:id])
    enforce_can :full, 'You do not have permission to edit this backlog' do
      begin
        @sprint.destroy
      rescue ActiveRecordExceptions::RecordNotDestroyable => e
        send_json_error 'This sprint cannot be deleted because it contains stories which are marked as accepted'
      rescue Exception => e
        raise e
      else
        update_backlog_metadata
        send_json_notice 'Sprint deleted'
      end
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    (@sprint || @backlog).can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    # set the @backlog instance variable from nested route
    # ensure user has access to this based on account
    def set_backlog_and_protect
      @backlog = Backlog.find(params[:backlog_id])
      if @backlog.account.users.find(current_user.id).blank?
        send_json_error 'You do not have permission to view this theme'
        return false
      end
    end

    def update_backlog_metadata
      @backlog.update_meta_data current_user
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_json_error message
      end
    end
end