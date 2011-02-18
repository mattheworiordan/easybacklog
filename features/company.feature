Feature: Company
  In order to group my backlogs
  A visitor
  Should be able to set up and use a company

  Scenario: Create a new company
    Given a user is registered
      And the standard locales are set up
    When I am on the home page
      And I follow "Log in"
      And I fill in "Email" with "john.doe@acme.com"
      And I fill in "Password" with "password"
      And I press "Sign in"
    Then I should see the notice "Signed in successfully."
    When I follow "create a new company"
    Then I should see the page title "Create a new company account"
    When I press "Create new company"
    Then I should see the following error messages:
      | Name can't be blank             |
      | Default rate can't be blank     |
      | Default velocity can't be blank |
      | Locale can't be blank           |
    When I fill in "Name" with "Acme Corporation"
      And I fill in "Default rate" with "800"
      And I fill in "Default velocity" with "3"
      And I select "British English" from "Locale"
      And I press "Create new company"
    Then I should see the notice "Company was successfully created."

    # check that redirect to company works if user has access to only one company 
    When I am on the companies page
    Then I should see the page title "Acme Corporation" 

    When I am on the new companies page
    When I fill in "Name" with "Acme Corporation"
      And I fill in "Default rate" with "800"
      And I fill in "Default velocity" with "3"
      And I select "British English" from "Locale"
      And I press "Create new company"
    Then I should see the following error messages:
      | Name has already been taken   |
    When I fill in "Name" with "News Corporation"
      And I press "Create new company"
    Then I should see the notice "Company was successfully created."

    When I am on the companies page
    And I follow "News Corporation"
    Then I should see the page title "News Corporation"
    