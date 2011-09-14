Given /^a user named "([^\"]+)" is registered$/ do |name|
  Factory.create(:user, :email => "#{name}@acme.com", :password => 'password', :password_confirmation => 'password')
end

Given /^(?:|I )am signed in as "([^\"]+)"$/ do |user_name|
  When %{I am on the home page}
    And %{I follow "Log In"}
    And %{I fill in "Email" with "#{user_name}@acme.com"}
    And %{I fill in "Password" with "password"}
    And %{I press "Log in"}
  Then %{I should see the notice "Signed in successfully."}
end