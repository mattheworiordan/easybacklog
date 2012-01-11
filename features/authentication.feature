Feature: Authentication
  In order to identify a user
  A visitor
  Should be able to register and login

  Scenario: Register
    Given the database has the necessary lookup tables
      And I am on the sign up page
      And I press "Sign up"
    Then I should see the following error messages:
      | Email can't be blank            |
      | Password can't be blank         |
      | Name can't be blank             |
      | Locale can't be blank           |
    When I fill in "Full name" with "John Doe"
      And I fill in "Account Name" with "Acme"
      And I fill in "Email" with "123"
      And I fill in "Password" with "456"
      And I fill in "Password confirmation" with "789"
      And I select "American English" from "What is your preferred language setting?"
      And I press "Sign up"
    Then I should see the following error messages:
      | Email is invalid                    |
      | Password doesn't match confirmation |
      | Password is too short               |
    When I fill in "Email" with "john.doe@acme.com"
      And I fill in "Password" with "password"
      And I fill in "Password confirmation" with "password"
      And I press "Sign up"
    Then I should see the notice "Your new account has been created for you"

  Scenario: Login
    Given a user named "John" is registered
    When I am on the home page
      And I follow "Log In"
      And I press "Log in"
    Then I should see the error "Invalid email or password."
    When I fill in "Email" with "John@acme.com"
      And I fill in "Password" with "password"
      And I press "Log in"
    Then I should see the notice "Signed in successfully."