# Users with access to an Account controller
# Root level users managed by the Devise controllers
class AccountUsersController < ApplicationController
  include AccountResource
  before_filter :check_account_admin

  def index
    @users = current_account.account_users.sort_by { |d| d.user.name }
    @invites = current_account.invited_users.sort_by(&:email)
  end

  # Support JSON updates only
  # Param editable is admin only as this is the only attribute on account_users
  def update
    @user = current_account.account_users.find_by_user_id(params[:id])
    @user.update_attributes(:admin => params[:admin])
    if @user.save
      render :json => @user
    else
      send_json_error 'Error'
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
    if valid_emails.empty? && flash[:error].empty?
      flash.now[:error] = "You need to enter at least one email address to add a user to your account."
    end

    if flash[:error]
      render :action => 'new'
    else
      flash[:notice] = "#{valid_emails.count} #{valid_emails.count == 1 ? 'person was' : 'people were'} added to your account."
      redirect_to :action => 'index'
    end

    valid_emails.each { |email| invite_user email }
  end

  private
    # before_filter to check that user has correct privilegs
    def check_account_admin
      unless is_account_admin?
        flash[:error] = 'You need admin rights to manage users for this account'
        redirect_to account_path(current_account)
      end
    end

    # send out the invites
    def invite_user(email)
      # check if user is a member of easyBacklog already
      if !User.where('UPPER(email) = ?', email.upcase).empty?
        # don't do anything if they already have access
        if current_account.users.where('UPPER(email) = ?', email.upcase).empty?
          invited_user = User.where('UPPER(email) = ?', email.upcase).first
          current_account.add_user invited_user
          AccountUsersNotifier.access_granted(current_user, current_account, invited_user).deliver
        end
      else # user is not a member
        if (current_account.invited_users.where('UPPER(email) = ?', email.upcase).empty?)
          invited_user = current_account.invited_users.create!(:email => email, :invitee_user_id => current_user.id)
        else
          invited_user = current_account.invited_users.where('UPPER(email) = ?', email.upcase).first
        end
        AccountUsersNotifier.invite_to_join(current_user, current_account, invited_user).deliver
      end
    end
end