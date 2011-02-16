class BacklogsController < ApplicationController
  before_filter :authenticate_user!, :set_company_and_protect

  def show
    @backlog = @company.backlogs.find(params[:id])
  end

  def new
    @backlog = @company.backlogs.new
  end

  def create
    @backlog = @company.backlogs.new(params[:backlog].merge(:author => current_user, :last_modified_user => current_user))
    if @backlog.save
      flash[:notice] = 'Backlog was successfully created.'
      redirect_to company_backlog_path(@company, @backlog)
    else
      render :action => "new"
    end
  end

  private
    # set the @company instance variable from nested oute
    # ensure user has access to this company
    def set_company_and_protect
      @company = Company.find(params[:company_id])
      if @company.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this company'
        redirect_to companies_path
      end
    end
end