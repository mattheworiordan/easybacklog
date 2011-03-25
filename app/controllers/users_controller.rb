class UsersController < ApplicationController
  include CompanyResource

  def index
    if is_company_admin?
      @users = @company.company_users
    else
      redirect_to company_path(@company)
    end
  end

  def update
    @user = @company.company_users.where(:user_id => params[:id]).first
    @user.update_attributes params
    if !@user.save
      render :json => @user
    else
      send_json_error 'Error'
    end
  end

  def destroy
    @user = @company.company_users.where(:user_id => params[:id]).first
    @user.destroy
    redirect_to company_users_path(@company)
  end
end