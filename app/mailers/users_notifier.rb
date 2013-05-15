class UsersNotifier < ActionMailerBase
  # notify an admin about a new user joining
  def new_user(new_user_id, new_account_id)
    @user = User.find(new_user_id)
    @account = Account.find(new_account_id)
    mail(:to => 'matt@easybacklog.com', :subject => "easyBacklog - new account #{@account.name}") do |format|
      format.text
    end.deliver
  end
end
