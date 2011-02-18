Given /^a company called "([^\"]+)" is set up for "([^\"]+)"$/ do |company_name, user_name|
  user = User.find_by_name(user_name)
  raise "User #{user_name} does not exist." if user.blank?
  Factory.create(:company_user, :user => user, :company => Factory.create(:company, :name => company_name) )
end