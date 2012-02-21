class CompaniesController < ApplicationController
  include AccountResource

  def show
    @company = current_account.companies.find(params[:id])
    respond_to do |format|
      format.json { render :json => @company }
    end
  end

  def edit
    @company = current_account.companies.find(params[:id])
    enforce_can(:full, 'You do not have permission to edit this company')
  end

  def update
    @company = current_account.companies.find(params[:id])
    enforce_can(:full, 'You do not have permission to edit this company') do
      @company.update_attributes(filter_params_for(:company, :days_estimatable, :has_company))
      if @company.save
        flash[:notice] = 'Company defaults were successfully updated'
        redirect_to account_path(current_account)
      else
        flash[:error] = "You have not completed the form correctly.\n#{@company.errors.full_messages.join("\n")}"
        render :action => "edit"
      end
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
        flash[:error] = message
        redirect_to account_path(current_account)
      end
    end
end