module AccountResource
  def self.included(base)
    base.send :before_filter, :authenticate_user!, :set_account_and_protect
  end

  private
    # set the @current_account instance variable from nested route
    # ensure user has access to this account
    def set_account_and_protect
      @current_account = Account.find(params[:account_id] || params[:id])
      if @current_account.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this account'
        redirect_to accounts_path
      end
    end
end