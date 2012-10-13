class UsersNotifier < ActionMailerBase
  # notify an admin about a new user joining
  def new_user(new_user, new_account)
    @user = new_user
    @account = new_account
    mail(:to => 'matt@easybacklog.com', :subject => "easyBacklog - new account #{new_account.name}") do |format|
      format.text
    end
  end
end
