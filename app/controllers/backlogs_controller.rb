class BacklogsController < ApplicationController
  include AccountResource
  after_filter :update_backlog_metadata, :only => [:update]
  basic_allowed :name_available
  BACKLOG_INCLUDES = [ { :themes => { :stories => :acceptance_criteria } }, { :sprints => { :sprint_stories => :story } } ]

  def show
    begin
      @backlog = current_account.backlogs.available.find(params[:id], :include => BACKLOG_INCLUDES)
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
    rescue ActiveRecord::RecordNotFound => exception
      flash[:warning] = 'The snapshot you were looking for does not exist'
      redirect_to account_path(current_account)
    else
      render_backlog_or_snapshot
    end
  end

  def new
    @backlog = current_account.backlogs.new
    @backlog.rate = current_account.default_rate if @backlog.rate.blank?
    @backlog.velocity = current_account.default_velocity if @backlog.velocity.blank?
    @backlog.use_50_90 = current_account.default_use_50_90 if @backlog.use_50_90.blank?
  end

  def create
    @backlog = current_account.backlogs.new(params[:backlog])
    @backlog.author = current_user
    @backlog.last_modified_user = current_user
    set_or_create_company
    if @backlog.save
      flash[:notice] = 'Backlog was successfully created.'
      redirect_to account_backlog_path(current_account, @backlog)
    else
      render :action => "new"
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
    @backlog.mark_archived
    flash[:notice] = "#{@backlog.name} archived"
    redirect_to account_path(current_account)
  end

  # put action to recover from archive
  def recover_from_archive
    @backlog = current_account.backlogs.available.find(params[:id])
    @backlog.recover_from_archive
    flash[:notice] = "#{@backlog.name} recovered from archive"
    redirect_to account_path(current_account)
  end

  def archives_index
    @account = current_account
    @archives = current_account.archived_backlogs_grouped_by_company
    @your_backlogs = @account.active_backlogs_grouped_by_company
  end

  def create_snapshot
    @backlog = current_account.backlogs.available.find(params[:id])
    name = params[:name]
    new_snapshot = @backlog.create_snapshot(name)
    flash[:notice] = "New snapshot created"
    redirect_to account_backlog_path(@backlog.account, @backlog)
  end

  # only supports JSON updates
  def update
    @backlog = current_account.backlogs.available.find(params[:id])
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
      @backlog.update_attributes(params[:backlog])
      @backlog.last_modified_user = current_user
      set_or_create_company
      if @backlog.save
        if params[:backlog][:archived] == 'true'
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

  def destroy
    @backlog = current_account.backlogs.available.find(params[:id])
    @backlog.mark_deleted
    flash[:notice] = 'Backlog was successfully deleted.'
    redirect_to account_path(current_account)
  end

  def destroy_snapshot
    @backlog = Backlog.available.where(:account_id => current_account.id).where(:id => params[:snapshot_id]).first
    @backlog.mark_deleted
    flash[:notice] = 'Snapshot was successfully deleted'
    redirect_to account_backlog_path(current_account, current_account.backlogs.find(params[:id]))
  end

  def duplicate
    @backlog = current_account.backlogs.available.find(params[:id])
    @new_backlog = current_account.backlogs.new(@backlog.attributes.merge(params[:backlog] || {}))
    @new_backlog.author = @backlog.author
    @new_backlog.last_modified_user = current_user
    if request.post?
      if @new_backlog.save
        @backlog.copy_children_to_backlog(@new_backlog)
        flash[:notice] = 'Backlog was duplicated successfully.'
        redirect_to account_backlog_path(current_account, @new_backlog)
      end
    end
  end

  # Used by AJAX form validator
  def name_available
    name = (params[:backlog] || {})[:name] || ''
    backlogs = current_account.backlogs.available
    backlogs = backlogs.where('ID <> ?', params[:exclude]) if params[:exclude]
    if backlogs.where('UPPER(name) like ?', name.upcase).empty?
      render :text => 'true'
    else
      render :text => 'false'
    end
  end

  def backlog_json(backlog)
    backlog_fields = [:id, :name, :account_id, :name, :rate, :velocity]
    backlog_methods = [:points, :days, :cost_formatted, :rate_formatted, :is_editable]
    theme_fields = [:id, :name, :code, :position]
    sprint_fields = [:id, :iteration, :start_on, :number_team_members, :duration_days]
    sprint_story_fields = [:id, :story_id, :sprint_story_status_id, :position]
    story_fields = [:id, :unique_id, :as_a, :i_want_to, :so_i_can, :comments, :score_50, :score_90, :position, :color]
    criteria_fields =  [:id, :criterion, :position]

    @backlog.to_json(:only => backlog_fields, :methods => backlog_methods,
      :include =>
      { :themes =>
        { :only => theme_fields,
          :include =>
          { :stories =>
            { :only => story_fields,
              :methods => [:cost_formatted, :days_formatted, :score],
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
    @backlog.sprints.to_json(:only => [:id, :iteration, :start_on, :number_team_members, :duration_days], :methods => [:completed?, :deletable?])
  end
  helper_method :sprints_json

  def current_account_locale_code
    @backlog.account.locale.code
  end
  helper_method :current_account_locale_code

  private
    def update_backlog_metadata
      @backlog.update_meta_data current_user unless @backlog.archived
    end

    def render_backlog_or_snapshot
      respond_to do |format|
        format.html { render :layout => 'backlog', :action => 'show' }

        # download an Excel file
        format.xls do
          filename = "#{@backlog.name.parameterize}.xls"
          set_download_headers filename
          render :layout => false, :action => 'show'
        end

        # download a PDF of the user story cards
        format.pdf do
          filename = "#{@backlog.name.parameterize}.pdf"
          set_download_headers filename
          themes = if params[:print_scope].blank?
            # print_scope is blank therefore display all themes
            @backlog.themes
          else
            # print_scope has an ID so user has selected a single theme
            @backlog.themes.select { |t| t.id.to_s == params[:print_scope] }
          end
          output = StoryCardsReport.new.to_pdf(themes, params[:page_size], params[:fold_side])
          send_data output, :filename => filename, :type => "application/pdf"
        end

        format.js do
          render :json => backlog_json(@backlog)
        end
      end
    end

    def set_or_create_company
      if params[:backlog][:has_company] == 'true'
        if params[:company_name].strip.length > 0
          # we are creating a new company (unless one exists with that name)
          @backlog.company = current_account.create_company(params[:company_name],
            :default_use_50_90 => @backlog.use_50_90,
            :default_velocity => @backlog.velocity,
            :default_rate => @backlog.rate)
        else
          if params[:backlog][:company_id].present?
            @backlog.company = current_account.companies.find_by_id(params[:backlog][:company_id])
          end
        end
      else
        @backlog.company = nil
      end
    end
end