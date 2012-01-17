class SprintsController < ApplicationController
  before_filter :authenticate_user!, :set_backlog_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]
  SPRINT_METHODS = [:completed?, :deletable?, :total_allocated_points, :total_expected_points, :total_completed_points]

  def index
    @sprints = @backlog.sprints.find(:all, :include => { :sprint_stories => :story })
    render :json => @sprints.to_json(:include => {
      :sprint_stories =>
        { :only => [:id, :story_id, :sprint_story_status_id, :position], :methods => :theme_id }
      },
      :methods => SPRINT_METHODS)
  end

  def show
    @sprint = @backlog.sprints.find(params[:id])
    render :json => @sprint.to_json(:methods => SPRINT_METHODS)
  end

  def create
    @sprint = @backlog.sprints.new(params.select { |key,val| [:start_on, :duration_days, :explicit_velocity, :number_team_members].include?(key.to_sym) })
    if @sprint.save
      render :json => @sprint.to_json(:methods => SPRINT_METHODS)
    else
      send_json_error @sprint.errors.full_messages.join(', ')
    end
  end

  def update
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
        render :json => @sprint.to_json(:methods => SPRINT_METHODS)
      end
    else
      @sprint.update_attributes params
      if @sprint.save
        render :json => @sprint.to_json(:methods => SPRINT_METHODS)
      else
        send_json_error @sprint.errors.full_messages.join(', ')
      end
    end
  end

  def destroy
    @sprint = @backlog.sprints.find(params[:id])
    @sprint.destroy
    send_json_notice 'Sprint deleted'
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
end