class AccountUsersNotifier < ActionMailerBase
  # send an invite to someone who is not registered to join
  def invite_to_join(invitee_user_id, account_id, invited_user_id)
    @invited_user = InvitedUser.find(invited_user_id)
    @invitee_user = User.find(invitee_user_id)
    @account = Account.find(account_id)
    mail(:to => @invited_user.email, :subject => 'Invite to join easyBacklog') do |format|
      format.text
    end.deliver
  end

  # user has been added to an account and already has a login so immediately has access
  def access_granted(invitee_user_id, account_id, invited_user_id)
    @invited_user = InvitedUser.find(invited_user_id)
    @invitee_user = User.find(invitee_user_id)
    @account = Account.find(account_id)
    mail(:to => @invited_user.email, :subject => 'Access granted to an account on easyBacklog') do |format|
      format.text
    end.deliver
  end

  def account_users_limit(account_id)
    @account = Account.find(account_id)
    mail(:to => 'matt@easybacklog.com', :subject => "easyBacklog - account #{@account.name} now has #{@account.users.count} users") do |format|
      format.text
    end.deliver
  end
end
