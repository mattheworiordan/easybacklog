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

  def update
    @backlog = @company.backlogs.find(params[:id])
    case params[:data_type]
    when 'backlog-name'
      @backlog.name = params[:new_value]
    end
    if !@backlog.changed?
      render :json => { :result => 'failure', :reason => 'No changes were detected'}
    elsif @backlog.save!
      render :json => { :result => 'success' }
    else
      render :json => { :result => 'failure', :reason => @backlog.errors.full_messages.join('<br/>') }
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