class InvitesController < ApplicationController
  before_filter :set_company

  # show represents the action when a user has been sent an invite and is visiting to get access
  def show
    invited_user = InvitedUser.find_by_id_and_security_code(params[:id],params[:security_code])
    if (invited_user.blank?)
      render :action => 'invalid_security_code'
    else
      @invite_company = invited_user.company
      # user is signed in, so just give them access
      if user_signed_in?
        if @invite_company.users.include?(current_user) then
          render :action => 'already_have_access'
        else
          render :action => 'access_granted'
        end
        # an invite URL is only valid once, so give the user access if they don't have access and delete the invite
        assign_user_access(invited_user)
      else # user needs to register or log in first, then take them back to this invite URL and give them access
        session[:after_register_redirect_to] = request.path
        @user = User.new(:email => invited_user.email)
      end
    end
  end

  def destroy
    if is_company_admin?
      @company.invited_users.find(params[:id]).destroy
      redirect_to company_users_path(@company)
    else
      flash[:error] = 'You need admin rights to manage users for this company'
      redirect_to company_path(@company)
    end
  end

  private
    # user has now registered, so let's assign them access
    def assign_user_access(invited_user)
      # don't add if user already has access
      unless invited_user.company.company_users.find_by_user_id(current_user.id)
        invited_user.company.company_users.create!(:user => current_user, :admin => false)
      end
      invited_user.destroy # delete the invite as now used
    end

    # set the @company variable which would normally use CompanyResource
    #  but CompanyResource requires a user to be logged in whereas for invites we cannot assume this
    def set_company
      @company = Company.find(params[:company_id])
    end
end