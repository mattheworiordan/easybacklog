class SprintsController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api, :authenticate_user!, :set_backlog_and_protect
  before_filter :stop_updates_if_locked, :only => [:create, :update, :destroy]

  JSON_METHODS = [:completed?, :deletable?, :total_allocated_points, :total_expected_points, :total_completed_points]
  XML_METHODS = JSON_METHODS - [:completed?, :deletable?] # ? causes invalid XML

  ## included in API
  def index
    enforce_can :read, 'You do not have permission to view this backlog' do
      if params[:include_associated_data].to_s == 'true'
        @sprints = @backlog.sprints.find(:all, :include => { :sprint_stories => :story })
        @sprints = @sprints.as_json(:include => { :sprint_stories => { :methods => :theme_id } }, :methods => data_transformation_methods)
      else
        @sprints = @backlog.sprints.as_json(:methods => data_transformation_methods)
      end
      respond_with(@sprints) do |format|
        format.xml { render :xml => @sprints.to_xml(:root => 'sprints') }
      end
    end
  end

  ## included in API
  def show
    find_params = params[:include_associated_data] ? { :include => { :sprint_stories => :story } } : {}
    @sprint = @backlog.sprints.find(params[:id], find_params)
    enforce_can :read, 'You do not have permission to view this backlog' do
      render request.format.to_sym => if params[:include_associated_data].to_s == 'true'
        @sprint.as_json(:include => { :sprint_stories => { :methods => :theme_id } }, :methods => data_transformation_methods)
      else
        @sprint.as_json(:methods => data_transformation_methods)
      end
    end
  end

  ## included in API
  def create
    enforce_can :full, 'You do not have permission to create this sprint' do
      sprint_saved = false
      Sprint.transaction do
        @sprint = @backlog.sprints.new(filter_sprint_params)
        sprint_saved = @sprint.save
        if sprint_saved
          update_backlog_metadata
        else
          raise ActiveRecord::Rollback
        end
      end

      if sprint_saved
        render request.format.to_sym => @sprint.as_json(:methods => data_transformation_methods), :status => STATUS_CODE[:created]
      else
        send_error @sprint, :http_status => :invalid_params
      end
    end
  end

  ## included in API
  def update
    enforce_can :full, 'You do not have permission to edit this backlog' do
      @sprint = @backlog.sprints.find(params[:id])
      Sprint.transaction do
        # changing completed is exclusive, no other updates will occur at the same time
        if (%w(true false).include? params[:completed])
          begin
            # special params set by front end to mark as completed or incomplete which can throw an error
            @sprint.mark_as_complete if params[:completed] == 'true'
            @sprint.mark_as_incomplete if params[:completed] == 'false'
            update_backlog_metadata
          rescue ActiveRecord::RecordInvalid => e
            send_error @sprint, :http_status => :invalid_params
          end
        else
          if @sprint.update_attributes filter_sprint_params
            update_backlog_metadata
          else
            send_error @sprint, :http_status => :invalid_params
            raise ActiveRecord::Rollback
          end
        end
      end

      if !performed?
        if is_api?
          render :nothing => true, :status => STATUS_CODE[:no_content]
        else
          render request.format.to_sym => @sprint.as_json(:methods => data_transformation_methods)
        end
      end
    end
  end

  ## included in API
  def destroy
    @sprint = @backlog.sprints.find(params[:id])
    enforce_can :full, 'You do not have permission to delete this sprint' do
      Sprint.transaction do
        begin
          @sprint.destroy
        rescue ActiveRecordExceptions::RecordNotDestroyable => e
          send_error 'This sprint cannot be deleted because it contains stories which are marked as accepted', :http_status => :forbidden
        rescue ActiveRecord::RecordNotSaved => e
          send_error e.message, :http_status => :forbidden
        else
          update_backlog_metadata
          if is_api?
            render :nothing => true, :status => STATUS_CODE[:no_content]
          else
            send_notice 'Sprint deleted'
          end
        end
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
      if @backlog.account.users.find_by_id(current_user.id).blank?
        send_error 'You do not have permission to view this backlog', :http_status => :forbidden
        return false
      end
    end

    def stop_updates_if_locked
      send_error 'This sprint cannot be updated as the backlog is not editable', :http_status => :forbidden unless @backlog.editable?
    end

    def update_backlog_metadata
      @backlog.update_meta_data current_user
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_error message, :http_status => :forbidden
      end
    end

    def data_transformation_methods
      self.class.const_get("#{request.format.to_sym.upcase}_METHODS")
    end

    def filter_sprint_params
      filter_params(:backlog_id, :iteration, *(JSON_METHODS + [:created_at, :updated_at]))
    end
end