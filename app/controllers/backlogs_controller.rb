class BacklogsController < ApplicationController
  before_filter :authenticate_user!, :set_company_and_protect

  def show
    @backlog = @company.backlogs.find(params[:id], :include => [:themes, { :themes => { :stories => :acceptance_criteria } } ])
    respond_to do |format|
      format.html { render :layout => 'backlog' }
      format.js do
        backlog_fields = [:id, :name, :company_id, :name, :rate, :velocity]
        backlog_methods = [:points, :days, :cost_formatted, :rate_formatted]
        theme_fields = [:id, :name, :code, :position]
        story_fields = [:id, :unique_id, :as_a, :i_want_to, :so_i_can, :comments, :score_50, :score_90, :position]
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

  def new
    @backlog = @company.backlogs.new
    @backlog.rate = @company.default_rate if @backlog.rate.blank?
    @backlog.velocity = @company.default_velocity if @backlog.velocity.blank?
  end

  def create
    @backlog = @company.backlogs.new(params[:backlog])
    @backlog.author = @backlog.last_modified_user = current_user
    if @backlog.save
      flash[:notice] = 'Backlog was successfully created.'
      redirect_to company_backlog_path(@company, @backlog)
    else
      render :action => "new"
    end
  end

  # only supports JSON updates
  def update
    @backlog = @company.backlogs.find(params[:id])
    @backlog.update_attributes params
    if @backlog.save
      render :json => @backlog.to_json(:methods => [:score_statistics, :rate_formatted])
    else
      send_json_error @backlog.errors.full_messages.join(', ')
    end
  end

  def destroy
    @backlog = @company.backlogs.find(params[:id])
    @backlog.destroy
    flash[:notice] = 'Backlog was successfully deleted.'
    redirect_to company_path(@company)
  end

  def duplicate
    @backlog = @company.backlogs.find(params[:id])
    @new_backlog = @company.backlogs.new(@backlog.attributes.merge(params[:backlog] || {}))
    @new_backlog.author = @backlog.author
    @new_backlog.last_modified_user = current_user
    if request.post?
      if @new_backlog.save
        @backlog.copy_children_to_backlog(@new_backlog)
        flash[:notice] = 'Backlog was duplicated successfully.'
        redirect_to company_backlog_path(@company, @new_backlog)
      end
    end
  end

  private
    # set the @company instance variable from nested route
    # ensure user has access to this company
    def set_company_and_protect
      @company = Company.find(params[:company_id])
      if @company.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this backlog'
        redirect_to companies_path
      end
    end
end