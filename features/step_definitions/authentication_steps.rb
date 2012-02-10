Given /^a user named "([^\"]+)" is registered$/ do |name|
  Factory.create(:user, :name => name, :email => "#{name.gsub(/ /,'')}@acme.com", :password => 'password', :password_confirmation => 'password')
end

Given /^(?:|I )am signed in as "([^\"]+)"$/ do |user_name|
  step %{I am on the home page}
  step %{I follow "Log In"}
  step %{I fill in "Email" with "#{user_name.gsub(/ /,'')}@acme.com"}
  step %{I fill in "Password" with "password"}
  step %{I press "Log in"}
  step %{I should see the notice "Signed in successfully."}
end