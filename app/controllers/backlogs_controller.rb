class BacklogsController < ApplicationController
  respond_to :html
  respond_to *API_FORMATS, :only => [:index, :show, :update, :create, :destroy, :duplicate, :index_snapshot, :show_snapshot, :destroy_snapshot]
  include AccountResource
  include ActionView::Helpers::TextHelper
  after_filter :update_backlog_metadata, :only => [:update]
  BACKLOG_INCLUDES = [ { :themes => { :stories => :acceptance_criteria } }, { :sprints => { :sprint_stories => [:story, :sprint_story_status] } } ]

  ## included in API
  def index
    backlogs = if params[:include_archived].to_s == 'true'
      current_account.backlogs.available
    else
      current_account.backlogs.active
    end
    respond_with(backlogs.order('updated_at desc').where_user_has_access(current_user)) do |format|
      format.html { redirect_to account_path(current_account) }
    end
  end

  ## included in API
  def show
    @backlog = current_account.backlogs.available.find(params[:id], :include => BACKLOG_INCLUDES)
    set_locale
    render_backlog_or_snapshot
  end

  ## included in API
  def show_snapshot
    master_backlog = current_account.backlogs.available.find(params[:id])
    @backlog = master_backlog.snapshots.find_by_id(params[:snapshot_id], :include => BACKLOG_INCLUDES)
    @backlog = master_backlog.sprint_snapshots.find(params[:snapshot_id], :include => BACKLOG_INCLUDES) if @backlog.blank?
    raise ActiveRecord::RecordNotFound.new('Snapshot was not found') if @backlog.blank?
    set_locale
    render_backlog_or_snapshot
  end

  def new
    if current_account.can?(:full, current_user)
      @backlog = current_account.backlogs.new
      @backlog.rate = current_account.default_rate if @backlog.rate.blank?
      @backlog.velocity = current_account.default_velocity if @backlog.velocity.blank?
      @backlog.use_50_90 = current_account.default_use_50_90 if @backlog.use_50_90.blank?
    else
      flash[:error] = 'You do not have permission to create backlogs'
      redirect_to account_path(current_account)
    end
  end

  ## included in API
  def create
    if current_account.can?(:full, current_user)
      @backlog = current_account.backlogs.new(filter_backlog_params)
      @backlog.author = current_user
      @backlog.last_modified_user = current_user

      backlog_saved = false
      Backlog.transaction do
        backlog_saved = @backlog.save
        if backlog_saved
          set_or_create_company
          backlog_saved = @backlog.save
        end
        raise ActiveRecord::Rollback if !backlog_saved
      end

      if backlog_saved
        respond_with(@backlog) do |format|
          format.html do
            flash[:notice] = 'Backlog was successfully created.'
            redirect_to account_backlog_path(current_account, @backlog)
          end
          format.any(*API_FORMATS) { render request.format.to_sym => @backlog, :status => STATUS_CODE[:created] }
        end
      else
        respond_with(@backlog) do |format|
          format.html { render :action => "new" }
          format.all { send_error @backlog, :http_status => :invalid_params }
        end
      end
    else
      send_error 'You do not have permission to create backlogs', :redirect_to => account_path(current_account), :http_status => :forbidden
    end
  end

  def edit
    begin
      @backlog = Backlog.available.where(:account_id => current_account.id).find(params[:id])
    rescue
      flash[:warning] = 'The backlog or snapshot does not exist'
      redirect_to account_path(current_account)
    end
  end

  # put action to archive a backlog
  def archive
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to archive this backlog') do
      @backlog.mark_archived
      flash[:notice] = "#{@backlog.name} archived"
      redirect_to account_path(current_account)
    end
  end

  # put action to recover from archive
  def recover_from_archive
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to recover this backlog from the archives') do
      @backlog.recover_from_archive
      flash[:notice] = "#{@backlog.name} recovered from archive"
      redirect_to account_path(current_account)
    end
  end

  ## included in API
  def create_snapshot
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to create a snapshot for this backlog') do
      name = params[:name]
      new_snapshot = @backlog.create_snapshot(name, async: true)
      respond_with(new_snapshot) do |format|
        format.html do
          flash[:notice] = "New snapshot being created"
          redirect_to account_backlog_path(@backlog.account, @backlog)
        end
        format.any(*API_FORMATS) { render request.format.to_sym => new_snapshot, :status => STATUS_CODE[:created] }
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    send_error e.message, :http_status => :invalid_params
  end

  ## included in API
  def update
    backlog_params = filter_backlog_params

    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to update this backlog') do
      if @backlog.archived? && backlog_params[:archived].to_s == 'false'
        @backlog.recover_from_archive
        respond_with(@backlog) do |format|
          format.html do
            flash[:notice] = 'Backlog has been restored from archive and is now active'
            redirect_to account_backlog_path(current_account, @backlog)
          end
        end
      elsif @backlog.archived? && backlog_params[:archived].to_s == 'true'
        respond_with(@backlog) do |format|
          format.html do
            # do nothing, user updated for no reason as no change
            redirect_to account_backlog_path(current_account, @backlog)
          end
        end
      elsif !@backlog.editable?
        send_error 'You cannot edit an archived backlog', :flash => :warning, :redirect_to => account_backlog_path(@backlog.account, @backlog), :http_status => :forbidden
      else
        backlog_saved = false
        has_been_archived = backlog_params && backlog_params[:archived].to_s == 'true'
        Backlog.transaction do
          backlog_saved = @backlog.update_attributes(backlog_params.reject { |key, val| key.to_sym == :archived })
          if backlog_saved
            @backlog.last_modified_user = current_user
            backlog_saved = @backlog.save
            if backlog_saved
              set_or_create_company
              backlog_saved = @backlog.save
              if backlog_saved && has_been_archived
                update_backlog_metadata
                @backlog.mark_archived
              end
            end
          end
          raise ActiveRecord::Rollback if !backlog_saved
        end

        if backlog_saved
          respond_with(@backlog) do |format|
            format.html do
              if has_been_archived
                flash[:notice] = 'Backlog is now archived'
              else
                flash[:notice] = 'Backlog settings were successfully updated'
              end
              redirect_to account_backlog_path(current_account, @backlog)
            end
            format.all do
              render :nothing => true, :status => 204
            end
          end
        else
          respond_to do |format|
            format.html do
              flash[:warning] = 'Backlog was not updated'
              render :action => 'edit'
            end
            format.all { send_error @backlog, :http_status => :invalid_params }
          end
        end
      end
    end
  end

  ## included in API
  def destroy
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to delete this backlog') do
      @backlog.mark_deleted
      respond_with(@backlog) do |format|
        format.html do
          flash[:notice] = 'Backlog was successfully deleted.'
          redirect_to account_path(current_account)
        end
      end
    end
  end

  ## included in API
  def destroy_snapshot
    master_backlog = current_account.backlogs.available.find(params[:id])
    @backlog = master_backlog.snapshots.find_by_id(params[:snapshot_id], :include => BACKLOG_INCLUDES)
    if @backlog.blank?
      if master_backlog.sprint_snapshots.find(params[:snapshot_id], :include => BACKLOG_INCLUDES).present?
        send_error 'You cannot delete a sprint snapshot, only manually created snapshots can be deleted', :http_status => :forbidden
      else
        raise ActiveRecord::RecordNotFound.new('Snapshot was not found') if @backlog.blank?
      end
    else
      enforce_can(:full, 'You do not have permission to delete this snapshot') do
        @backlog.mark_deleted
        respond_with(@backlog) do |format|
          format.html do
            flash[:notice] = 'Snapshot was successfully deleted'
            redirect_to account_backlog_path(current_account, current_account.backlogs.find(params[:id]))
          end
        end
      end
    end
  end

  ## included in API
  def duplicate
    @backlog = current_account.backlogs.available.find(params[:id])
    if current_account.can?(:full, current_user)
      enforce_can(:read, 'You do not have permission to view or duplicate this backlog') do
        @new_backlog = current_account.backlogs.new(@backlog.safe_attributes.merge(filter_backlog_params || {}))
        @new_backlog.prohibit_account_updates = true # ensure updates to account are not fired as this is a duplicate so ignore any account updates
        @new_backlog.author = @backlog.author
        @new_backlog.last_modified_user = current_user
        @new_backlog.not_ready_status = "Duplicating backlog"
        @new_backlog.not_ready_since = Time.now
        if request.post?
          if @new_backlog.save
            BacklogWorker::CopyChildrenToBacklog.perform_async(@backlog.id, @new_backlog.id)
            respond_with(@new_backlog, :location => account_backlog_path(current_account, @new_backlog)) do |format|
              format.html do
                flash[:notice] = 'Backlog is being duplicated...'
                redirect_to account_backlog_path(current_account, @new_backlog)
              end
            end
          else
            respond_to do |format|
              format.html { render }
              format.any(:json, :xml) { send_error @new_backlog, :http_status => :invalid_params }
            end
          end
        else
          respond_to do |format|
            format.html { render }
            format.any(:json, :xml) { send_error 'Unsupported request', :http_status => :not_acceptable }
          end
        end
      end
    else
      send_error 'You do not have permission to create a new backlog in this account', :redirect_to => account_backlog_path(current_account, @backlog), :http_status => :forbidden
    end
  end

  # in HTML mode, returns a partial to replace snapshots drop down when a sprint is marked as complete and thus a snapshot is created
  ## included in API
  def index_snapshot
    @backlog = current_account.backlogs.available.find(params[:id])
    render_options = {
      :manual_snapshots => @backlog.snapshots,
      :sprint_snapshots => @backlog.sprint_snapshots
    }
    respond_to do |format|
      format.html do
        render :partial => 'snapshot_select'
      end
      format.xml { render :xml => render_options.send("to_xml", :root => 'snapshots') }
      format.json { render :json => render_options }
    end
  end

  # used by Backlog view to get a list of backlogs that the user can move a theme into
  def append_targets
    json_result = current_account.backlogs.masters.active.where_user_has_access(current_user).order(:name).reject do |backlog|
      backlog.name =~ /Example corporate website backlog/i
    end.map do |backlog|
      target_name = truncate(backlog.name, :length => 35)
      target_name = "#{target_name} (#{truncate(backlog.company.name, :length => 20)})" if backlog.company.present?
      { :id => backlog.id, :name => target_name }
    end
    render :json => json_result
  end

  def backlog_json(backlog)
    backlog_fields = [:id, :name, :account_id, :name, :rate, :velocity]
    backlog_methods = [:points, :days, :cost_formatted, :rate_formatted, :is_locked, :valid_scores]
    theme_fields = [:id, :name, :code, :position]
    theme_methods = [:points, :cost_formatted, :days]
    sprint_fields = [:id, :iteration, :start_on, :number_team_members, :duration_days, :explicit_velocity]
    sprint_story_fields = [:id, :story_id, :sprint_story_status_id, :position]
    story_fields = [:id, :unique_id, :as_a, :i_want_to, :so_i_can, :comments, :score_50, :score_90, :position, :color]
    criteria_fields =  [:id, :criterion, :position]
    story_methods = if @backlog.cost_estimatable?
      [:cost_formatted, :days_formatted, :score]
    elsif @backlog.days_estimatable?
      [:days_formatted, :score]
    else
      [:score]
    end

    # override the as_json method for backlog_json so that it sends is_editable and is_status_editable based on the current user
    # if this was in the model, this would violate the fact that the model should not be aware of the current_user
    # same is done to ensure only current user backlog settings are returned
    def @backlog.as_json(options = {})
      json = super(options)
      json['backlog_user_settings'] = {}
      if options.has_key?(:current_user)
        current_user = options[:current_user]
        json['is_editable'] = self.editable? ? self.can?(:full, current_user) : false
        json['is_status_editable'] = self.editable? ? self.can?(:readstatus, current_user) : false
        settings = backlog_user_settings.where(:user_id => current_user)
        json['backlog_user_settings'] = settings.first if settings
      else
        json['is_editable'] = false
        json['is_status_editable'] = false
      end
      json
    end

    @backlog.to_json(:only => backlog_fields, :methods => backlog_methods, :current_user => current_user,
      :include =>
      { :themes =>
        { :only => theme_fields,
          :methods => theme_methods,
          :include =>
          { :stories =>
            { :only => story_fields,
              :methods => story_methods,
              :include =>
              { :acceptance_criteria =>
                { :only => criteria_fields }
              }
            }
          }
        },
        :sprints =>
        { :only => sprint_fields,
          :methods => [:completed?, :deletable?, :total_allocated_points, :total_expected_points, :total_completed_points],
          :include =>
          { :sprint_stories =>
            {
              :only => sprint_story_fields,
              :methods => :theme_id
            }
          }
        }
      })
  end
  helper_method :backlog_json

  def sprints_json(backlog)
    @backlog.sprints.to_json(:only => [:id, :iteration, :start_on, :number_team_members, :duration_days, :explicit_velocity], :methods => [:completed?, :deletable?])
  end
  helper_method :sprints_json

  def current_locale_code
    @backlog.locale.code
  end
  helper_method :current_locale_code

  def is_example_backlog?
    @backlog.name =~ /example corporate website backlog/i
  end
  helper_method :is_example_backlog?

  helper_method :can?, :cannot?
  def can?(method)
    # get permissions from parent backlog if one exists
    master_backlog = if @backlog.is_snapshot?
      @backlog.all_snapshot_master
    else
      @backlog
    end
    master_backlog.can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    def update_backlog_metadata
      @backlog.update_meta_data current_user unless @backlog.archived || @backlog.errors.present?
    end

    def render_backlog_or_snapshot
      if cannot? :read
        send_error 'You are not allowed to view this backlog', :redirect_to => account_path(current_account), :http_status => :forbidden
      else
        respond_to do |format|
          format.html do
            render :layout => 'backlog', :action => 'show'
          end

          # download an Excel file
          format.xls do
            filename = "#{@backlog.name.parameterize}.xls"
            headers['Content-Type'] = 'application/vnd.ms-excel'
            set_download_headers filename
            render :layout => false, :action => 'show'
          end

          # download a PDF of the user story cards
          format.pdf do
            filename = "#{@backlog.name.parameterize}.pdf"
            set_download_headers filename
            stories = if params[:print_scope] =~ /sprint-(\d+)/
              # print_scope has an ID so user has selected a single sprint
              @backlog.sprints.select { |t| t.id.to_s == $1 }
            elsif params[:print_scope] =~ /theme-(\d+)/
              # print_scope has an ID so user has selected a single theme
              @backlog.themes.select { |t| t.id.to_s == $1 }
            else
              # print_scope is blank therefore display all themes
              @backlog.themes
            end
            stories = stories.map { |t| t.stories }.flatten
            output = StoryCardsReport.new.to_pdf(stories, params[:page_size], params[:fold_side])
            send_data output, :filename => filename, :type => "application/pdf"
          end

          format.json do
            if params[:include_associated_data].to_s == 'true'
              render :json => backlog_json(@backlog)
            else
              render :json => @backlog
            end
          end

          format.xml do
            if params[:include_associated_data].to_s == 'true'
              render :action => 'show'
            else
              render :xml => @backlog
            end
          end
        end
      end
    end

    def set_or_create_company
      if params[:backlog] && params[:backlog][:has_company] == 'true'
        if params[:company_name].strip.length > 0
          # we are creating a new company (unless one exists with that name)
          @backlog.company = current_account.create_company(params[:company_name],
            :default_use_50_90 => @backlog.use_50_90,
            :default_velocity => @backlog.velocity,
            :default_rate => @backlog.rate)
        else
          if params[:backlog][:company_id].present?
            @backlog.company = current_account.companies.find_by_id(params[:backlog][:company_id])
          else
            @backlog.company = nil
          end
        end
      else
        @backlog.company = nil
      end
    end

    def set_locale
      # only localise to the language, ignore the country
      I18n.locale = @backlog.locale.code.split('-').first.to_sym
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        send_error message, :redirect_to => account_backlog_path(current_account, @backlog), :http_status => :forbidden
      end
    end

    def filter_backlog_params
      params_namespace = is_api? ? nil : :backlog
      filter_params_for params_namespace, :days_estimatable, :has_company, :company_id, :valid_scores, :backlog_user_settings, :account_id
    end

    def error_scope_name
      action_name =~ /snapshot/ ? 'Snapshot' : 'Backlog'
    end
end