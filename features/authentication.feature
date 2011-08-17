Feature: Authentication
  In order to identify a user
  A visitor
  Should be able to register and login

  Scenario: Register
    When I am on the home page
      And the standard locales are set up
      And I follow "Sign up"
      And I press "Sign up"
    Then I should see the following error messages:
      | Email can't be blank            |
      | Password can't be blank         |
      | Name can't be blank             |
      | Default rate can't be blank     |
      | Default velocity can't be blank |
      | Locale can't be blank           |
    When I fill in "Full name" with "John Doe"
      And I fill in "Account Name" with "Acme"
      And I fill in "Default day rate" with "a"
      And I fill in "Default velocity" with "b"
      And I fill in "Email" with "123"
      And I fill in "Password" with "456"
      And I fill in "Password confirmation" with "789"
      And I select "American English" from "What is your preferred language setting?"
      And I press "Sign up"
    Then I should see the following error messages:
      | Email is invalid                    |
      | Password doesn't match confirmation |
      | Password is too short               |
      | Default rate is not a number        |
      | Default velocity is not a number    |
    When I fill in "Email" with "john.doe@acme.com"
      And I fill in "Password" with "password"
      And I fill in "Password confirmation" with "password"
      And I fill in "Default day rate" with "800"
      And I fill in "Default velocity" with "3"
      And I press "Sign up"
    Then I should see the notice "Your new account has been created for you"

  Scenario: Login
    Given a user named "John" is registered
      And I am signed in as "John"
