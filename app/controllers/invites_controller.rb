class InvitesController < ApplicationController
  before_filter :set_current_account
  ssl_required :show, :destroy if use_ssl?

  # show represents the action when a user has been sent an invite and is visiting to get access
  def show
    invited_user = InvitedUser.find_by_id_and_security_code(params[:id],params[:security_code])
    if (invited_user.blank?)
      render :action => 'invalid_security_code'
    else
      @invite_account = invited_user.account
      # user is signed in, so just give them access
      if user_signed_in?
        if @invite_account.users.include?(current_user) then
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
    if is_account_admin?
      current_account.invited_users.find(params[:id]).destroy
      redirect_to account_users_path(current_account)
    else
      flash[:error] = 'You need admin rights to manage users for this account'
      redirect_to account_path(current_account)
    end
  end

  private
    # user has now registered, so let's assign them access
    def assign_user_access(invited_user)
      # don't add if user already has access
      unless invited_user.account.account_users.find_by_user_id(current_user.id)
        invited_user.account.add_user current_user
      end
      invited_user.destroy # delete the invite as now used
    end

    # set the @current_account variable which would normally use AccountResource
    #  but AccountResource requires a user to be logged in whereas for invites we cannot assume this
    def set_current_account
      @current_account = Account.find(params[:account_id])
    end
end