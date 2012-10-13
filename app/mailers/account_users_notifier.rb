class AccountUsersNotifier < ActionMailerBase
  # send an invite to someone who is not registered to join
  def invite_to_join(invitee_user, account, invited_user)
    @invited_user = invited_user
    @invitee_user = invitee_user
    @account = account
    mail(:to => invited_user.email, :subject => 'Invite to join easyBacklog') do |format|
      format.text
    end
  end

  # user has been added to an account and already has a login so immediately has access
  def access_granted(invitee_user, account, invited_user)
    @invited_user = invited_user
    @invitee_user = invitee_user
    @account = account
    mail(:to => invited_user.email, :subject => 'Access granted to an account on easyBacklog') do |format|
      format.text
    end
  end

  def account_users_limit(account)
    @account = account
    logger.info ">>> Sent notification email #{account.users.count}"
    mail(:to => 'matt@easybacklog.com', :subject => "easyBacklog - account #{account.name} now has #{account.users.count} users") do |format|
      format.text
    end
  end
end
