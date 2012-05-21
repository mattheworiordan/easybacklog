class BacklogUsersController < ApplicationController
  include AccountResource
  before_filter :check_account_admin, :set_backlog

  respond_to :html, :only => [:index]
  respond_to :json, :only => [:update]

  def index
    @account_users = current_account.account_users.sort_by { |d| d.user.name }.index_by(&:user_id)
    # allow company inherited permissions to override account inherited permissions
    @account_users.merge! @backlog.company.company_users.index_by(&:user_id) if @backlog.company.present?

    @backlog_users = @backlog.backlog_users.index_by(&:user_id)
  end

  # Support JSON updates only
  def update
    begin
      user = current_account.users.find(params[:id])

      if params[:privilege] == '(inherited)'
        # delete any explicit privileges as we will inherit
        @backlog.delete_user user
      else
        privilege = Privilege.find(params[:privilege])
        @backlog.add_or_update_user user, privilege
      end

      send_notice 'Permissions updated successfully'
    rescue ActiveRecord::RecordNotFound
      send_error 'Invalid parameters', :http_status => :invalid_params
    end
  end

  private
    # before_filter to check that user has correct privileges
    def check_account_admin
      unless is_account_admin?
        send_error 'You need admin rights to manage users for this backlog', :redirect_to => account_path(current_account), :http_status => :forbidden
      end
    end

    def set_backlog
      @backlog = current_account.backlogs.find(params[:backlog_id])
    end
end