class BacklogsController < ApplicationController
  before_filter :authenticate_user!, :set_company_and_protect

  def show
    @backlog = @company.backlogs.find(params[:id], :include => [:themes, { :themes => { :stories => :acceptance_criteria } } ])
    respond_to do |format|
      format.html
      format.js do
        render :json => @backlog.to_json(:include => { :themes => { :include => { :stories => { :include => :acceptance_criteria } } } })
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
      render :json => @backlog
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