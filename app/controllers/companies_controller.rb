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
  end

  def update
    @company = current_account.companies.find(params[:id])
    @company.update_attributes(params[:company])
    if @company.save
      flash[:notice] = 'Company defaults were successfully updated.'
      redirect_to account_path(current_account)
    else
      render :action => "edit"
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
end