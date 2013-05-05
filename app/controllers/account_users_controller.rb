# Users with access to an Account controller
# Root level users managed by the Devise controllers
class AccountUsersController < ApplicationController
  include AccountResource
  before_filter :check_account_admin

  def index
    @users = current_account.account_users.sort_by { |d| d.user.name }.index_by(&:user_id)
    @invites = current_account.invited_users.sort_by(&:email)
  end

  # Support JSON updates only
  # Param editable is admin only as this is the only attribute on account_users
  def update
    @user = current_account.account_users.find_by_user_id(params[:id])
    @user.update_attributes(:admin => params[:admin]) if params.has_key?(:admin)
    @user.update_attributes(:privilege => params[:privilege]) if params.has_key?(:privilege)
    if @user.save
      render :json => @user
    else
      send_json_error 'Error: ' + @user.errors.full_messages
    end
  end

  def destroy
    @user = current_account.account_users.find_by_user_id(params[:id])
    @user.destroy
    redirect_to account_users_path(current_account)
  end

  def create
    valid_emails = []
    @emails = params[:emails] || ''
    @emails.split(/[,;\n\r\s]+/).each do |email|
      unless (email.strip.empty?)
        if !(email =~ /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i)
          flash.now[:error] = "The email address '#{email}' is not valid.  Please correct this to continue."
        else
          valid_emails << email.strip
        end
      end
    end
    flash.now[:error] = "You need to enter at least one email address to add a user to your account." if valid_emails.empty? && flash[:error].empty?
    flash.now[:error] = "#{flash.now[:error].present? ? flash.now[:error] + "\n" : "" }You must choose the account permissions for your invitees" if params[:privileges].blank?

    if flash[:error]
      render :action => 'new'
    else
      valid_emails.each { |email| invite_user email, params[:privileges] }
      flash[:notice] = "#{valid_emails.count} #{valid_emails.count == 1 ? 'person was' : 'people were'} added to your account."
      redirect_to :action => 'index'
    end
  end

  private
    # before_filter to check that user has correct privileges
    def check_account_admin
      unless is_account_admin?
        flash[:error] = 'You need admin rights to manage users for this account'
        redirect_to account_path(current_account)
      end
    end

    # send out the invites
    def invite_user(email, privilege)
      # check if user is a member of easyBacklog already
      if User.where('UPPER(email) = ?', email.upcase).present?
        # add user and rights if they already have access
        account_user = current_account.users.where('UPPER(email) = ?', email.upcase)
        if account_user.empty?
          invited_user = User.where('UPPER(email) = ?', email.upcase).first
          current_account.add_user invited_user, privilege
          AccountUsersNotifier.delay.access_granted(current_user, current_account, invited_user)
        else
          # simply upgrade privileges of user
          current_account.account_users.find_by_user_id(account_user.first.id).upgrade_privilege privilege
        end
      else # user is not a member
        if (current_account.invited_users.where('UPPER(email) = ?', email.upcase).empty?)
          # user has not been previously invited
          invited_user = current_account.invited_users.create!(:email => email, :invitee_user_id => current_user.id, :privilege => privilege)
        else
          # user has been previously invited, just update their privileges
          invited_user = current_account.invited_users.where('UPPER(email) = ?', email.upcase).first
          invited_user.update_attributes! :privilege => privilege
        end
        AccountUsersNotifier.delay.invite_to_join(current_user, current_account, invited_user)
      end
    end
end