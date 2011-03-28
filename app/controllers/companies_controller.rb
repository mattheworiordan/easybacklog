class CompaniesController < ApplicationController
  before_filter :authenticate_user!, :except => :name_available

  def index
    redirect_to company_path(current_user.companies.first) if current_user.companies.length == 1
    @companies = current_user.companies.order('LOWER(name)')
  end

  def show
    @company = Company.find(params[:id])
    @current_company = @company # used for current_company method of Application controller

    if @company.users.find(current_user.id).blank?
      flash[:error] = 'You do not have permission to view this company'
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
      @company.add_first_user current_user
      flash[:notice] = 'Company was successfully created.'
      redirect_to(@company)
    else
      if (@company.errors.on(:locale))
        @company.errors.add(:locale_id, @company.errors.on(:locale).to_s)
        @company.errors.delete(:locale)
      end
      render :action => "new"
    end
  end

  def name_available
    account_name = (params[:company] || {})[:name] || ''
    if Company.where('UPPER(name) like ?', account_name.upcase).empty?
      render :text => 'true'
    else
      render :text => 'false'
    end
  end
end