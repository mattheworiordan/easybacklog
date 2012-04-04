class BacklogsController < ApplicationController
  include AccountResource
  include ActionView::Helpers::TextHelper
  after_filter :update_backlog_metadata, :only => [:update]
  BACKLOG_INCLUDES = [ { :themes => { :stories => :acceptance_criteria } }, { :sprints => { :sprint_stories => :story } } ]

  def show
    begin
      @backlog = current_account.backlogs.available.find(params[:id], :include => BACKLOG_INCLUDES)
      set_locale
    rescue ActiveRecord::RecordNotFound => exception
      flash[:warning] = 'The backlog you were looking for does not exist'
      redirect_to account_path(current_account)
    else
      render_backlog_or_snapshot
    end
  end

  def show_snapshot
    begin
      @backlog = current_account.backlogs.available.find(params[:id]).snapshots.find(params[:snapshot_id], :include => BACKLOG_INCLUDES)
      set_locale
    rescue ActiveRecord::RecordNotFound => exception
      flash[:warning] = 'The snapshot you were looking for does not exist'
      redirect_to account_path(current_account)
    else
      render_backlog_or_snapshot
    end
  end

  def show_sprint_snapshot
    begin
      sprint_snapshot = current_account.backlogs.available.find(params[:id]).sprint_snapshots.find { |d| d.id.to_s == params[:snapshot_id] }
      raise ActiveRecord::RecordNotFound.new('Sprint snapshot was not found') if sprint_snapshot.blank?
      @backlog = Backlog.find(sprint_snapshot.id, :include => BACKLOG_INCLUDES)
      set_locale
    rescue ActiveRecord::RecordNotFound => exception
      flash[:warning] = 'The snapshot you were looking for does not exist'
      redirect_to account_path(current_account)
    else
      render_backlog_or_snapshot
    end
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

  def create
    if current_account.can?(:full, current_user)
      @backlog = current_account.backlogs.new(filter_backlog_params)
      @backlog.author = current_user
      @backlog.last_modified_user = current_user
      set_or_create_company
      if @backlog.save
        flash[:notice] = 'Backlog was successfully created.'
        redirect_to account_backlog_path(current_account, @backlog)
      else
        render :action => "new"
      end
    else
      flash[:error] = 'You do not have permission to create backlogs'
      redirect_to account_path(current_account)
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

  def create_snapshot
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to create a snapshot for this backlog') do
      name = params[:name]
      new_snapshot = @backlog.create_snapshot(name)
      flash[:notice] = "New snapshot created"
      redirect_to account_backlog_path(@backlog.account, @backlog)
    end
  end

  # only supports JSON updates
  def update
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to update this backlog') do
      if @backlog.archived? && params[:backlog][:archived] == 'false'
        @backlog.recover_from_archive
        flash[:notice] = 'Backlog has been restored from archive and is now active'
        redirect_to account_backlog_path(current_account, @backlog)
      elsif @backlog.archived? && params[:backlog][:archived] == 'true'
        # do nothing, user updated for no reason as no change
        redirect_to account_backlog_path(current_account, @backlog)
      elsif !@backlog.editable?
        flash[:notice] = 'You cannot edit an archived backlog'
        redirect_to account_backlog_path(@backlog.account, @backlog)
      else
        @backlog.update_attributes(filter_backlog_params)
        @backlog.last_modified_user = current_user
        set_or_create_company
        if @backlog.save
          if params[:backlog] && params[:backlog][:archived] == 'true'
            update_backlog_metadata
            @backlog.mark_archived
            flash[:notice] = 'Backlog is now archived'
          else
            flash[:notice] = 'Backlog settings were successfully updated'
          end
          redirect_to account_backlog_path(current_account, @backlog)
        else
          render :action => "edit"
        end
      end
    end
  end

  def destroy
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to delete this backlog') do
      @backlog.mark_deleted
      flash[:notice] = 'Backlog was successfully deleted.'
      redirect_to account_path(current_account)
    end
  end

  def destroy_snapshot
    @backlog = Backlog.available.where(:account_id => current_account.id).where(:id => params[:snapshot_id]).first
    enforce_can(:full, 'You do not have permission to delete this snapshot') do
      @backlog.mark_deleted
      flash[:notice] = 'Snapshot was successfully deleted'
      redirect_to account_backlog_path(current_account, current_account.backlogs.find(params[:id]))
    end
  end

  def duplicate
    @backlog = current_account.backlogs.available.find(params[:id])
    enforce_can(:full, 'You do not have permission to duplicate this backlog') do
      @new_backlog = current_account.backlogs.new(@backlog.safe_attributes.merge(params[:backlog] || {}))
      @new_backlog.author = @backlog.author
      @new_backlog.last_modified_user = current_user
      if request.post?
        if @new_backlog.save
          @backlog.copy_children_to_backlog(@new_backlog)
          flash[:notice] = 'Backlog was duplicated successfully.'
          redirect_to account_backlog_path(current_account, @new_backlog)
        end
      end
    end#
  end

  # returns a partial to replace snapshots drop down when a sprint is marked as complete and thus a snapshot is created
  def snapshots_list_html
    @backlog = current_account.backlogs.available.find(params[:id])
    render :partial => 'snapshot_select'
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
    def @backlog.as_json(options = {})
      json = super(options)
      if options.has_key?(:current_user)
        current_user = options[:current_user]
        json['is_editable'] = self.editable? ? self.can?(:full, current_user) : false
        json['is_status_editable'] = self.editable? ? self.can?(:readstatus, current_user) : false
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

  def current_account_locale_code
    @backlog.account.locale.code
  end
  helper_method :current_account_locale_code

  def is_example_backlog?
    @backlog.name =~ /example corporate website backlog/i
  end
  helper_method :is_example_backlog?

  helper_method :can?, :cannot?
  def can?(method)
    @backlog.can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    def update_backlog_metadata
      @backlog.update_meta_data current_user unless @backlog.archived
    end

    def render_backlog_or_snapshot
      respond_to do |format|
        format.html do
          if can? :read
            render :layout => 'backlog', :action => 'show'
          else
            flash[:error] = 'You are not allowed to view this backlog'
            redirect_to account_path(current_account)
          end
        end

        # download an Excel file
        format.xls do
          if can? :read
            filename = "#{@backlog.name.parameterize}.xls"
            headers['Content-Type'] = 'application/vnd.ms-excel'
            set_download_headers filename
            render :layout => false, :action => 'show'
          else
            flash[:error] = 'You are not allowed to view this backlog'
            redirect_to account_path(current_account)
          end
        end

        # download a PDF of the user story cards
        format.pdf do
          if can? :read
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
          else
            flash[:error] = 'You are not allowed to view this backlog'
            redirect_to account_path(current_account)
          end
        end

        format.js do
          if can? :read
            render :json => backlog_json(@backlog)
          else
            send_json_error 'You are not allowed to view this backlog'
          end
        end

        format.xml do
          if can? :read
            render
          else
            send_xml_error 'You are not allowed to view this backlog'
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

      if @backlog.company.blank?
        # if account does not yet have defaults, assign them to the account
        unless @backlog.account.defaults_set?
          unassigned_attributes = {
            :default_velocity => @backlog.velocity,
            :default_rate => @backlog.rate,
            :default_use_50_90 => @backlog.use_50_90
          }
          @backlog.account.update_attributes! unassigned_attributes
        end
      end
    end

    def set_locale
      # only localise to the language, ignore the country
      I18n.locale = @backlog.account.locale.code.split('-').first.to_sym
    end

    def enforce_can(rights, message)
      if can? rights
        yield
      else
        flash[:error] = message
        redirect_to account_backlog_path(current_account, @backlog)
      end
    end

    def filter_backlog_params
      filter_params_for :backlog, :days_estimatable, :has_company, :company_id, :archived, :valid_scores
    end
end