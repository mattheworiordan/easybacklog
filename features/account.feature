Feature: Account
  In order to group my backlogs
  A visitor
  Should be able to set up and use an account

  Scenario: Create a new account
    Given a user named "John" is registered
      And I am signed in as "John"
      And the database has the necessary lookup tables
      And I am on the new account page
    Then I should see the page title "Create a new account"
    When I press "Create new account"
    Then I should see the following error messages:
      | Name can't be blank             |
      | Locale can't be blank           |
    When I fill in "Name" with "Acme Corporation"
      And I select "British English" from "What is your preferred language setting?"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."

    # check that redirect to account works if user has access to only one account
    When I am on the accounts page
    Then I should see the page title "Acme Corporation"

    # now check that example backlog has been added and tooltip is showing
    Then I should see the text "Example corporate website backlog"
      And I should see the text "We've added this great example and walk through"
    When I follow "Create a new backlog"
      And I fill in "Name the backlog" with "My first backlog"
      And I fill in "Rate (optional)" with "500"
      And I fill in "Velocity" with "3"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created"
    When I follow "← Back to dashboard"
    # tool tip should be gone as we only show this when we have one backlog
      Then I should not see the text "We've added this great example and walk through"

    When I am on the new account page
    When I fill in "Name" with "Acme Corporation"
      And I select "British English" from "What is your preferred language setting?"
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
      And "British English" should be selected for "What is your preferred language setting?"
      And the "By default, use the 50/90 estimation method" checkbox should not be checked
      And the "Modified Fibonacci" checkbox should be checked
    When I fill in "Name" with "News Corporation2"
      And I select "American English" from "What is your preferred language setting?"
      And I check "By default, use the 50/90 estimation method"
      And I choose "Strict Fibonacci"
      And I fill in "Rate (optional)" with "602"
      And I fill in "Velocity" with "42"
      And I press "Update account"
    Then I should see the notice "Account for News Corporation2 updated successfully"

    When I follow "Manage account"
    Then I should see the page title "Edit account"
      And the "Name" field should contain "News Corporation2"
      And the "Rate (optional)" field should contain "602"
      And the "Velocity" field should contain "2"
      And "American English" should be selected for "What is your preferred language setting?"
      And the "By default, use the 50/90 estimation method" checkbox should be checked
      And the "Strict Fibonacci" checkbox should be checked

  @javascript
  Scenario: Toggle use of rate and velocity
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And an account called "Acme" is set up for "John" who should have admin rights
      And I am signed in as "John"
      And I am on the accounts page
    When I follow "Manage account"
    Then I should see the page title "Edit account"
    When I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
    Then the "account velocity" should not be visible
      And the "account rate" should not be visible
    When I press "Update account"
    Then I should see the notice "Account for Acme updated successfully"
    When I follow "Manage account"
    # ensure settings are retained after save and correct fields are hidden
    Then I should see "By default, would you like to have"
      And the "No, I'd prefer to estimate once I set up my first iteration and defined the velocity" checkbox should be checked
      And the "account velocity" should not be visible
      And the "account rate" should not be visible
    When I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
    Then the "account velocity" should be visible
      And the "account rate" should be visible
      And the "Velocity" field should be empty
      And the "Rate (optional)" field should be empty
    When I fill in "Velocity" with "2.0"
      And I fill in "Rate (optional)" with "55"
      # now check settings are retained when toggling calculation preference
      And I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
    Then the "Velocity" field should contain "2.0"
      And the "Rate (optional)" field should contain "55"
    When I press "Update account"
    Then I should see the notice "Account for Acme updated successfully"
    When I follow "Manage account"
    # ensure settings are retained after save and correct fields are hidden
    Then the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked
      And the "account velocity" should be visible
      And the "account rate" should be visible
      And the "Velocity" field should contain "2.0"
      And the "Rate (optional)" field should contain "55"

  @javascript
  Scenario: When creating a new account, backlog setting defaults should not be visible
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And I am on the new account page
    Then I should see the page title "Create a new account"
      # check that no automatic calculation fields are asked
      And I should not see "automatically calculated"
      # check that no 50/90 rules are asked
      And I should not see "50/90"
      # ensure fib question is deferred to first backlog creation
      And I should not see "Fibonacci"

  @javascript
  Scenario: When editing an account that is new and does not have any defaults set, the preference should be to use estimation and it should be shown
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And I am on the new account page
    Then I should see the page title "Create a new account"
    When I fill in "Name" with "Acme Corporation"
      And I select "British English" from "What is your preferred language setting?"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."
    When I follow "Manage account"
    Then I should see the page title "Edit account"
      # check that velocity & rate are empty, yet days estimation is recommended to the user as the account defaults have not been set
      And the "account velocity" should be visible
      And the "Velocity" field should be empty
      And the "account rate" should be visible
      And the "Rate (optional)" field should be empty
      And the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked
