Feature: Authentication
  In order to identify a user
  A visitor
  Should be able to register and login

  Scenario: Register
    When I am on the home page
      And I follow "Sign up"
      And I press "Sign up"
    Then I should see the following error messages:
      | Email can't be blank    |
      | Password can't be blank |
      | Name can't be blank     |
    When I fill in "Name" with "John Doe"
      And I fill in "Company" with "Acme"
      And I fill in "Email" with "123"
      And I fill in "Password" with "456"
      And I fill in "Password confirmation" with "789"
      And I press "Sign up"
    Then I should see the following error messages:
      | Email is invalid                    |
      | Password doesn't match confirmation |
      | Password is too short               |
    When I fill in "Email" with "john.doe@acme.com"
      And I fill in "Password" with "password"
      And I fill in "Password confirmation" with "password"
      And I press "Sign up"
    Then I should see the notice "You have signed up successfully"
  
  Scenario: Login
    Given a user named "John" is registered
      And I am signed in as "John"
      