class SprintStoriesController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api, :authenticate_user!, :set_sprint_and_protect
  after_filter :update_backlog_metadata, :only => [:create, :update, :destroy]
  before_filter :stop_updates_if_locked, :only => [:create, :update, :destroy]

  ## include in API
  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      @sprint_stories = @sprint.sprint_stories.find(:all)
      custom_respond_with @sprint_stories
    end
  end

  ## include in API
  def show
    @sprint_story = @sprint.sprint_stories.find(params[:id])
    enforce_can :read, 'You do not have permission to view this backlog' do
      custom_respond_with @sprint_story
    end
  end

  ## include in API
  def create
    enforce_can :readstatus, 'You do not have permission to update the status of stories' do
      @sprint_story = @sprint.sprint_stories.new(filter_sprint_story_params)
      @sprint_story.sprint_id = params[:sprint_id]
      @sprint_story.story_id = params[:story_id]
      if @sprint_story.save
        custom_respond_with @sprint_story, :http_status => :created
      else
        send_error @sprint_story, :http_status => :invalid_params
      end
    end
  end

  ## include in API
  def update
    enforce_can :readstatus, 'You do not have permission to update the status of stories' do
      @sprint_story = @sprint.sprint_stories.find(params[:id])
      SprintStory.transaction do
        sprint_story_saved = @sprint_story.update_attributes filter_sprint_story_params
        if sprint_story_saved
          @sprint_story.sprint_id = params[:move_to_sprint_id] if params.has_key?(:move_to_sprint_id)
          sprint_story_saved = @sprint_story.save
          if sprint_story_saved
            if is_api?
              render :nothing => true, :status => :no_content
            else
              custom_respond_with @sprint_story
            end
          end
        end
        if !sprint_story_saved
          send_error @sprint_story, :http_status => :invalid_params
          raise ActiveRecord::Rollback
        end
      end
    end
  end

  def update_order
    enforce_can :readstatus, 'You do not have permission to update the order of stories' do
      ids = params[:ids]
      sprint_stories = []
      SprintStory.transaction do
        ids.each do |id, position|
          sprint_story = @sprint.sprint_stories.find(id)
          sprint_story.position = position
          sprint_story.save!
          sprint_stories << sprint_story
        end
      end
      # now return all the updated sprint stories so we can update the models in the front end
      render request.format.to_sym => sprint_stories
    end
  end

  ## include in API
  def destroy
    @sprint_story = @sprint.sprint_stories.find(params[:id])
    enforce_can :readstatus, 'You do not have permission to update the status of stories' do
      @sprint_story.destroy
      if is_api?
        render :nothing => true, :status => :no_content
      else
        send_notice "Sprint story removed from sprint", :sprint_statistics => {
          :total_expected_points => @sprint.total_expected_points,
          :total_completed_points => @sprint.total_completed_points,
          :total_allocated_points => @sprint.total_allocated_points
        }
      end
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
      if @sprint.backlog.account.users.find_by_id(current_user.id).blank?
        send_error 'You do not have permission to view this sprint story', :http_status => :forbidden, :redirect_to => accounts_path
      end
    end

    def stop_updates_if_locked
      send_error 'This sprint story cannot be updated as the backlog or sprint is not editable', :http_status => :forbidden unless @sprint.editable? && @sprint.backlog.editable?
    end

    def update_backlog_metadata
      @sprint.backlog.update_meta_data current_user
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_error message, :http_status => :forbidden
      end
    end

    def filter_sprint_story_params
      filter_params :sprint_id, :story_id, :theme_id, :sprint_statistics, :move_to_sprint_id, :created_at, :updated_at
    end

    # if API don't send stats data, but if for front end then send some helpful data
    def custom_respond_with(data, options = {})
      http_status = options[:http_status] ? STATUS_CODE[options[:http_status]] : STATUS_CODE[:ok]
      if is_api?
        render request.format.to_sym => data, :status => http_status
      else
        render request.format.to_sym => data.as_json(:methods => [:theme_id, :sprint_statistics]), :status => http_status
      end
    end
end