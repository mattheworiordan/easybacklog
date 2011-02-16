class CompaniesController < ApplicationController
  before_filter :authenticate_user!

  def index
    redirect_to company_path(current_user.companies.first) if current_user.companies.length == 1
    @companies = current_user.companies.order('LOWER(name)')
  end

  def show
    @company = Company.find(params[:id])

    if @company.users.find(current_user.id).blank?
      flash[:alert] = 'You do not have permission to view this company'
      redirect_to companies_path
    else
      @companies_count = current_user.companies.count
      @backlogs = @company.backlogs.order('LOWER(name)')
    end
  end

  def new
    @company = Company.new
  end

  def create
    @company = Company.new(params[:company])
    if @company.save
      @company.company_users.create! :user => current_user, :admin => true
      flash[:notice] = 'Company was successfully created.'
      redirect_to(@company)
    else
      render :action => "new"
    end
  end
end