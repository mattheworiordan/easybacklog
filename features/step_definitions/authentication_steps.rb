Given /^a user named "([^\"]+)" is registered$/ do |name|
  FactoryGirl.create(:user, :name => name, :email => "#{name.gsub(/ /,'')}@acme.com", :password => 'password', :password_confirmation => 'password')
end

Given /^(?:|I )am signed in as "([^\"]+)"$/ do |user_name|
  step %{I am on the home page}
  step %{I follow "Log in"}
  step %{I fill in "Email" with "#{user_name.gsub(/ /,'')}@acme.com"}
  step %{I fill in "Password" with "password"}
  step %{I press "Log in"}
  step %{I should see the notice "Signed in successfully."}
end

When /^(?:|I )sign out$/ do
  supports_javascript = page.evaluate_script('true') rescue false
  if supports_javascript
    step %{I click on the "user account dropdown" within "top nav"}
  end
  step %{I follow "Sign out" within "top nav"}
end