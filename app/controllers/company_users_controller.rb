class CompanyUsersController < ApplicationController
  include AccountResource
  before_filter :check_account_admin, :set_company

  def index
    @account_users = current_account.account_users.sort_by { |d| d.user.name }
    @company_users = @company.company_users.index_by(&:user_id)
  end

  # Support JSON updates only
  def update
    begin
      # ensure user ID is a valid user for this account
      account_user = current_account.account_users.find_by_user_id(params[:id])
      raise ActiveRecord::RecordNotFound.new if account_user.blank?
      user = account_user.user

      if params[:privilege] == '(inherited)'
        # delete any explicit privileges as we will inherit
        @company.delete_user user
      else
        privilege = Privilege.find(params[:privilege])
        @company.add_or_update_user user, privilege
      end

      send_json_notice 'Permissions updated successfully'
    rescue ActiveRecord::RecordNotFound
      send_json_error "Invalid parameters sent"
    end
  end

  private
    # before_filter to check that user has correct privileges
    def check_account_admin
      unless is_account_admin?
        flash[:error] = 'You need admin rights to manage users for this company'
        redirect_to account_path(current_account)
      end
    end

    # set the @backlog instance variable from nested route
    # ensure user has access to this based on account
    def set_company
      @company = Company.find(params[:company_id])
    end
end