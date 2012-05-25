class CompaniesController < ApplicationController
  include AccountResource

  respond_to :html, :except => [:index, :create]
  respond_to :xml, :json, :only => [:index, :show, :create, :update]

  ## only for API
  def index
    respond_with current_account.companies
  end

  ## included in API
  def show
    @company = current_account.companies.find(params[:id])
    respond_with @company
  end

  def edit
    @company = current_account.companies.find(params[:id])
    enforce_can(:full, 'You do not have permission to edit this company')
  end

  ## included in API
  def update
    @company = current_account.companies.find(params[:id])
    enforce_can(:full, 'You do not have permission to edit this company') do
      @company.update_attributes(filter_company_params)
      if @company.save
        respond_with(@company) do |format|
          format.html do
            flash[:notice] = 'Company defaults were successfully updated'
            redirect_to account_path(current_account)
          end
        end
      else
        respond_with(@company) do |format|
          format.html do
            flash[:error] = "You have not completed the form correctly.\n#{@company.errors.full_messages.join("\n")}"
            render :action => "edit"
          end
          format.all { send_error "Company could not be updated: #{@company.errors.full_messages.join(', ')}", :http_status => :unprocessable_entity }
        end
      end
    end
  end

  ## only in API, normally company is created at the time the backlog is created
  def create
    if current_account.can?(:full, current_user)
      @company = Company.new(filter_company_params)
      if @company.save
        respond_with(@company, :location => account_company_path(current_account, @company))
      else
        send_error @company.errors.full_messages.join(', '), :http_status => :invalid_params
      end
    else
      send_error 'You do not have permission to create a company', :http_status => :forbidden
    end
  end

  def name_available
    company_name = (params[:company] || {})[:name] || ''
    if (params[:except] || '').upcase == company_name.upcase
      render :text => 'true'
    elsif current_account.companies.where('UPPER(name) like ?', company_name.upcase).empty?
      render :text => 'true'
    else
      render :text => 'false'
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    @company.can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    def enforce_can(rights, message)
      if can?(rights)
        yield if block_given?
      else
        send_error message, :redirect_to => account_path(current_account), :http_status => :forbidden
      end
    end

    def filter_company_params
      params_namespace = is_api? ? nil : :company
      filter_params_for params_namespace, :days_estimatable, :has_company, :account_id
    end
end