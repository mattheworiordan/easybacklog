Given /^a user is registered$/ do
  Factory.create(:user, :email => 'john.doe@acme.com', :password => 'password', :password_confirmation => 'password')
end