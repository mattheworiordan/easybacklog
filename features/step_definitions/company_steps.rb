Given /^an account called "([^\"]+)" is set up for "([^\"]+)"$/ do |account_name, user_name|
  user = User.find_by_name(user_name)
  raise "User #{user_name} does not exist." if user.blank?
  Factory.create(:account_user, :user => user, :account => Factory.create(:account, :name => account_name) )
end