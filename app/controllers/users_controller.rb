class UsersController < ApplicationController
  include CompanyResource
  before_filter :check_company_admin

  def index
    @users = @company.company_users
    @invites = @company.invited_users
  end

  def update
    @user = @company.company_users.find_by_user_id(params[:id])
    @user.update_attributes params
    if @user.save
      render :json => @user
    else
      send_json_error 'Error'
    end
  end

  def destroy
    @user = @company.company_users.find_by_user_id(params[:id])
    @user.destroy
    redirect_to company_users_path(@company)
  end

  def create
    valid_emails = []
    @emails = params[:emails] || ''
    @emails.split(/[,;\n\r]/).each do |email|
      unless (email.strip.empty?)
        if !(email =~ /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i)
          flash.now[:error] = "The email address '#{email}' is not valid.  Please correct this to continue."
        else
          valid_emails << email
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
    def check_company_admin
      unless is_company_admin?
        flash[:error] = 'You need admin rights to manage users for this company'
        redirect_to company_path(@company)
      end
    end

    # send out the invites
    def invite_user(email)
      # check if user is a member of easyBacklog already
      if !User.where('UPPER(email) = ?', email.upcase).empty?
        # don't do anything if they already have access
        if @company.users.where('UPPER(email) = ?', email.upcase).empty?
          invited_user = User.where('UPPER(email) = ?', email.upcase).first
          @company.company_users.create!(:user => invited_user, :admin => false)
          UsersNotifier.access_granted(current_user, @company, invited_user).deliver
        end
      else # user is not a member
        if (@company.invited_users.where('UPPER(email) = ?', email.upcase).empty?)
          invited_user = @company.invited_users.create!(:email => email, :invitee_user_id => current_user.id)
        else
          invited_user = @company.invited_users.where('UPPER(email) = ?', email.upcase).first
        end
        UsersNotifier.invite_to_join(current_user, @company, invited_user).deliver
      end
    end
end