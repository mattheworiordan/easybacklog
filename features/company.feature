Feature: Company
  In order to group my backlogs
  A visitor
  Should be able to set up and use an account

  Scenario: Create a new account
    Given a user named "John" is registered
      And I am signed in as "John"
      And the standard locales are set up
      And I am on the new account page
    Then I should see the page title "Create a new account"
    When I press "Create new account"
    Then I should see the following error messages:
      | Name can't be blank             |
      | Default rate can't be blank     |
      | Default velocity can't be blank |
      | Locale can't be blank           |
    When I fill in "Name" with "Acme Corporation"
      And I fill in "Default day rate" with "800"
      And I fill in "Default velocity achieved per day" with "3"
      And I select "British English" from "What is your preferred language setting?"
      And I uncheck "By default, use the 50/90 estimation method"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."

    # check that redirect to account works if user has access to only one account
    When I am on the accounts page
    Then I should see the page title "Acme Corporation"

    When I am on the new account page
    When I fill in "Name" with "Acme Corporation"
      And I fill in "Default day rate" with "600"
      And I fill in "Default velocity achieved per day" with "4"
      And I select "British English" from "What is your preferred language setting?"
      And I check "By default, use the 50/90 estimation method"
      And I press "Create new account"
    Then I should see the following error messages:
      | Name has already been taken   |
    When I fill in "Name" with "News Corporation"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."

    When I am on the accounts page
    And I follow "News Corporation"
    Then I should see the page title "News Corporation"

    When I follow "Manage account"
    Then I should see the page title "Edit account"
      And the "Name" field should contain "News Corporation"
      And the "Default day rate" field should contain "600"
      And the "Default velocity achieved per day" field should contain "4"
      And "What is your preferred language setting?" should be selected for "British English"
      And the "By default, use the 50/90 estimation method" checkbox should be checked
    When I fill in "Name" with "News Corporation2"
      And I fill in "Default day rate" with "602"
      And I fill in "Default velocity achieved per day" with "42"
      And I select "American English" from "What is your preferred language setting?"
      And I uncheck "By default, use the 50/90 estimation method"
      And I press "Update account"
    Then I should see the notice "Account for News Corporation2 updated successfully"

    When I follow "Manage account"
    Then I should see the page title "Edit account"
      And the "Name" field should contain "News Corporation2"
      And the "Default day rate" field should contain "602"
      And the "Default velocity achieved per day" field should contain "2"
      And "What is your preferred language setting?" should be selected for "American English"
      And the "By default, use the 50/90 estimation method" checkbox should not be checked

