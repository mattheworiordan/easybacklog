Given /^an account called "([^\"]+)" is set up for "([^\"]+)"(| who should have admin rights)$/ do |account_name, user_name, is_admin|
  user = User.find_by_name(user_name)
  raise "User #{user_name} does not exist." if user.blank?
  au = Factory.create(:account_user, :user => user, :account => Factory.create(:account, :name => account_name), :admin => is_admin.blank? ? false : true )
end

Given /^a user named "([^\"]+)" is created and assigned to account "([^\"]+)"$/ do |user_name, account_name|
  account = Account.find_by_name(account_name)
  raise "Account #{account_name} does not exist." if account.blank?
  au = Factory.create(:account_user, :user => Factory.create(:user, :name => user_name, :email => "#{user_name}@acme.com"), :account => account, :admin => false )
end