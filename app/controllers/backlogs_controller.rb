class BacklogsController < ApplicationController
  include CompanyResource
  after_filter :update_backlog_metadata, :only => [:update]
  BACKLOG_INCLUDES = [:themes, { :themes => { :stories => :acceptance_criteria } } ]

  def show
    @backlog = current_company.backlogs.find(params[:id], :include => BACKLOG_INCLUDES)
    render_backlog_or_snapshot
  end

  def show_snapshot
    @backlog = current_company.backlogs.find(params[:id]).snapshots.find(params[:snapshot_id], :include => BACKLOG_INCLUDES)
    render_backlog_or_snapshot
  end

  def new
    @backlog = current_company.backlogs.new
    @backlog.rate = current_company.default_rate if @backlog.rate.blank?
    @backlog.velocity = current_company.default_velocity if @backlog.velocity.blank?
  end

  def create
    @backlog = current_company.backlogs.new(params[:backlog])
    @backlog.author = current_user
    @backlog.last_modified_user = current_user
    if @backlog.save
      flash[:notice] = 'Backlog was successfully created.'
      redirect_to company_backlog_path(current_company, @backlog)
    else
      render :action => "new"
    end
  end

  def create_snapshot
    @backlog = current_company.backlogs.find(params[:id])
    name = params[:name]
    new_snapshot = @backlog.create_snapshot(name)
    redirect_to snapshot_company_backlog_path(@backlog.company, @backlog, new_snapshot)
  end

  # only supports JSON updates
  def update
    @backlog = current_company.backlogs.find(params[:id])
    @backlog.update_attributes params
    if @backlog.save
      render :json => @backlog.to_json(:methods => [:score_statistics, :rate_formatted])
    else
      send_json_error @backlog.errors.full_messages.join(', ')
    end
  end

  def destroy
    @backlog = current_company.backlogs.find(params[:id])
    @backlog.destroy
    flash[:notice] = 'Backlog was successfully deleted.'
    redirect_to company_path(current_company)
  end

  def duplicate
    @backlog = current_company.backlogs.find(params[:id])
    @new_backlog = current_company.backlogs.new(@backlog.attributes.merge(params[:backlog] || {}))
    @new_backlog.author = @backlog.author
    @new_backlog.last_modified_user = current_user
    if request.post?
      if @new_backlog.save
        @backlog.copy_children_to_backlog(@new_backlog)
        flash[:notice] = 'Backlog was duplicated successfully.'
        redirect_to company_backlog_path(current_company, @new_backlog)
      end
    end
  end

  # Used by AJAX form validator
  def name_available
    name = (params[:backlog] || {})[:name] || ''
    if current_company.backlogs.where('UPPER(name) like ?', name.upcase).empty?
      render :text => 'true'
    else
      render :text => 'false'
    end
  end

  private
    def update_backlog_metadata
      @backlog.update_meta_data current_user
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
          backlog_fields = [:id, :name, :company_id, :name, :rate, :velocity]
          backlog_methods = [:points, :days, :cost_formatted, :rate_formatted]
          theme_fields = [:id, :name, :code, :position]
          story_fields = [:id, :unique_id, :as_a, :i_want_to, :so_i_can, :comments, :score_50, :score_90, :position, :color]
          criteria_fields =  [:id, :criterion, :position]
          render :json => @backlog.to_json(:only => backlog_fields, :methods => backlog_methods,
            :include =>
            { :themes =>
              { :only => theme_fields,
                :include =>
                { :stories =>
                  { :only => story_fields,
                    :methods => [:cost_formatted, :days_formatted],
                    :include =>
                    { :acceptance_criteria =>
                      { :only => criteria_fields }
                    }
                  }
                }
              }
            })
        end
      end
    end
end