Given /^an account called "([^\"]+)" is set up for "([^\"]+)"(?:| who should have (account admin|read only|read only and status update|full access|no) rights)$/ do |account_name, user_name, rights|
  user = User.find_by_name(user_name)
  raise "User #{user_name} does not exist." if user.blank?
  account_user_options = {
    :user => user,
    :account => Factory.create(:account, :name => account_name)
  }
  case rights
    when 'account admin'
      account_user_options.merge! :admin => true
    when 'read only'
      account_user_options.merge! :privilege => 'read'
    when 'read only and status update'
      account_user_options.merge! :privilege => 'readstatus'
    when 'full access'
      account_user_options.merge! :privilege => 'full'
    when 'no'
      account_user_options.merge! :privilege => 'none'
  end

  au = Factory.create(:account_user, account_user_options)
end

Given /^a user named "([^\"]+)" is created (?:with (read only|read only and status update|full access|no) rights )?and assigned to account "([^\"]+)"$/ do |user_name, rights, account_name|
  account = Account.find_by_name(account_name)
  raise "Account #{account_name} does not exist." if account.blank?
  account_user_type = case rights
    when 'read only'
      :account_user_with_read_rights
    when 'read only and status updates'
      :account_user_with_read_status_rights
    when 'full access'
      :account_user_with_full_rights
    when 'no'
      :account_user_with_no_rights
    else
      :account_user
  end
  au = Factory.create(account_user_type, :user => Factory.create(:user, :name => user_name, :email => "#{user_name.gsub(/ /, '')}@acme.com"), :account => account, :admin => false)
end