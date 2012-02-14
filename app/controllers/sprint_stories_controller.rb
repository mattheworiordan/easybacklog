class SprintStoriesController < ApplicationController
  before_filter :authenticate_user!, :set_sprint_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]

  METHODS = [:theme_id, :sprint_statistics]
  INCLUDE_FIELDS = [:id, :story_id, :sprint_story_status_id, :position]

  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      @sprint_stories = @sprint.sprint_stories.find(:all)
      render :json => @sprint_stories.to_json(:methods => METHODS, :only => INCLUDE_FIELDS)
    end
  end

  def show
    @sprint_story = @sprint.sprint_stories.find(params[:id])
    enforce_can :read, 'You do not have permission to view this backlog' do
      render :json => @sprint_story.to_json(:methods => METHODS, :only => INCLUDE_FIELDS)
    end
  end

  def create
    enforce_can :readstatus, 'You do not have permission to update the status of stories' do
      @sprint_story = @sprint.sprint_stories.new(safe_sprint_story_params)
      @sprint_story.sprint_id = params[:sprint_id]
      @sprint_story.story_id = params[:story_id]
      if @sprint_story.save
        render :json => @sprint_story.to_json(:methods => METHODS, :only => INCLUDE_FIELDS)
      else
        send_json_error @sprint_story.errors.full_messages.join(', ')
      end
    end
  end

  def update
    enforce_can :readstatus, 'You do not have permission to update the status of stories' do
      @sprint_story = @sprint.sprint_stories.find(params[:id])
      @sprint_story.update_attributes safe_sprint_story_params
      @sprint_story.sprint_id = params[:move_to_sprint_id] if params.has_key?(:move_to_sprint_id)

      if @sprint_story.save
        render :json => @sprint_story.to_json(:methods => METHODS, :only => INCLUDE_FIELDS)
      else
        send_json_error @sprint_story.errors.full_messages.join(', ')
      end
    end
  end

  def update_order
    enforce_can :readstatus, 'You do not have permission to update the order of stories' do
      begin
        ids = params[:ids]
        sprint_stories = []
        ids.each do |id, position|
          sprint_story = @sprint.sprint_stories.find(id)
          sprint_story.position = position
          sprint_story.save!
          sprint_stories << sprint_story
        end
        # now return all the updated sprint stories so we can update the models in the front end
        render :json => sprint_stories
      rescue ActiveRecord::RecordNotFound
        send_json_error "Sprint story could not be found"
      rescue Exception => e
        send_json_error "Sprint stories could not be reordered #{e}"
      end
    end
  end

  def destroy
    begin
      @sprint_story = @sprint.sprint_stories.find(params[:id])
      enforce_can :readstatus, 'You do not have permission to update the status of stories' do
        @sprint_story.destroy
        send_json_notice "Sprint story removed from sprint", :sprint_statistics => {
          :total_expected_points => @sprint.total_expected_points,
          :total_completed_points => @sprint.total_completed_points,
          :total_allocated_points => @sprint.total_allocated_points
        }
      end
    rescue ActiveRecord::RecordNotFound
      send_json_error "Sprint story was not found and is likely deleted"
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    (@sprint_story || @sprint).can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    # set the @sprint instance variable from nested oute
    # ensure user has access to this based on account
    def set_sprint_and_protect
      @sprint = Sprint.find(params[:sprint_id])
      if @sprint.backlog.account.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this sprint story'
        redirect_to accounts_path
      end
    end

    def update_backlog_metadata
      @sprint.backlog.update_meta_data current_user
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_json_error message
      end
    end

    def safe_sprint_story_params
      safe_params :sprint_id, :story_id, :theme_id, :sprint_statistics
    end
end