module AccountResource
  include HttpStatusCodes
  def self.included(base)
    base.send :before_filter, :authenticate_user!, :set_account_and_protect
  end

  private
    # set the @current_account instance variable from nested route
    # ensure user has access to this account
    def set_account_and_protect
      begin
        @current_account = Account.find(params[:account_id])
        if @current_account.users.where(:id => current_user.id).blank?
          send_error 'You do not have permission to view this account', :http_status => :forbidden
        end
      rescue ActiveRecord::RecordNotFound => not_found
        send_error "Account with ID #{params[:account_id]} does not exist", :http_status => :not_found
      end
    end
end