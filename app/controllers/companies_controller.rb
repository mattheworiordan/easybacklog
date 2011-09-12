class CompaniesController < ApplicationController
  include AccountResource
  ssl_required :show if use_ssl?

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
end