Feature: Account
  In order to group my backlogs
  A visitor
  Should be able to set up and use an account

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"

  Scenario: Create a new account
    Given I am on the new account page
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
    Given an account called "Acme" is set up for "John" who should have account admin rights
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
    Given I am on the new account page
    Then I should see the page title "Create a new account"
      # check that no automatic calculation fields are asked
      And I should not see "automatically calculated"
      # check that no 50/90 rules are asked
      And I should not see "50/90"
      # ensure fib question is deferred to first backlog creation
      And I should not see "Fibonacci"

  @javascript
  Scenario: When editing an account that is new and does not have any defaults set, the preference should be to use estimation and it should be shown
    Given I am on the new account page
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

  Scenario: When user has read only access they should not be able to create new backlogs
    Given an account called "Acme" is set up for "John" who should have read only rights
      And I am on the accounts page
    Then I should see "Your backlogs"
      And I should not see "Create a new backlog"

  Scenario: When user has none access they should not see any backlogs and should see a notice saying they do not yet have access to any backlogs
    Given an account called "Acme" is set up for "John" who should have no rights
      And a backlog named "Backlog uno" assigned to company "Test" for account "Acme" is set up
      And a backlog named "Backlog duo" assigned to company "Test" for account "Acme" is set up
      And I am on the accounts page
    Then I should not see "Backlog uno"
      And I should not see "Backlog duo"
      And I should see "You do not have access to any backlogs in this account."

  Scenario: When user has full access they see backlogs and be able to create new backlogs
    Given an account called "Acme" is set up for "John" who should have full access rights
      And a backlog named "Backlog 1" assigned to company "Test" for account "Acme" is set up
      And I am on the accounts page
    Then I should see "Backlog 1"
      And I should see "Create a new backlog"
    When I follow "Create a new backlog"
      Then I should see the page title "Create a backlog"

  @javascript
  Scenario: Admin user should be presented with edit links in account dash board for company and account
    Given an account called "Acme" is set up for "John" who should have account admin rights
      And a standard backlog named "Backlog uno" is set up for "Acme"
      And a backlog named "Backlog duo" assigned to company "Editable company" for account "Acme" is set up
    When I am on the accounts page
    Then within the "dashboard company or account fields" there should be a clickable element with the text "Acme"
      And within the "dashboard company or account fields" there should be a clickable element with the text "Editable company"
      And within "your side panel" there should be a clickable element with the text "Acme"
      And within "your side panel" there should be a clickable element with the text "Editable company"

  @javascript
  Scenario: User with full acces rights should be presented with edit links in account dash board for company and account
    Given an account called "Acme" is set up for "John" who should have full access rights
      And a standard backlog named "Backlog uno" is set up for "Acme"
      And a backlog named "Backlog duo" assigned to company "Editable company" for account "Acme" is set up
    When I am on the accounts page
    Then within the "dashboard company or account fields" there should be a clickable element with the text "Acme"
      And within the "dashboard company or account fields" there should be a clickable element with the text "Editable company"
      And within "your side panel" there should be a clickable element with the text "Acme"
      And within "your side panel" there should be a clickable element with the text "Editable company"

  @javascript
  Scenario: User with read rights should not be presented with edit links in account dash board for company and account
    Given an account called "Acme" is set up for "John" who should have read only rights
      And a standard backlog named "Backlog uno" is set up for "Acme"
      And a backlog named "Backlog duo" assigned to company "Editable company" for account "Acme" is set up
    When I am on the accounts page
    Then I should see the text "Acme" within "your side panel"
      And I should see the text "Editable company" within "your side panel"
      And within the "dashboard company or account fields" there should not be a clickable element with the text "Acme"
      And within the "dashboard company or account fields" there should not be a clickable element with the text "Editable company"
      And within "your side panel" there should not be a clickable element with the text "Acme"
      And within "your side panel" there should not be a clickable element with the text "Editable company"

  @javascript
  Scenario: User with no privileges to an account but read only privileges to a company should see that company's backlogs on the multiple accounts dashboard page
    Given an account called "Acme" is set up for "John" who should have no rights
      And an account called "Microsoft" is set up for "John" who should have read only rights
      And a standard backlog named "Backlog uno" is set up for "Acme"
      And a backlog named "Backlog duo" assigned to company "Company with access" for account "Acme" is set up
      And "John" is given full access rights for company "Company with access"
      And I am on the home page
    Then I should see "Latest activity across all accounts"
      And I should not see "Backlog uno"
      And I should see "Backlog duo"
      And within the "dashboard company or account fields" there should be a clickable element with the text "Company with access"

  Scenario: User updates their settings
    Given an account called "Acme" is set up for "John" who should have no rights
    When I am on the home page
      And I follow "John"
      And I follow "My settings"
    Then I should see "Edit My Settings" within the "primary page heading"
      And I should see the page title "Edit My Settings"
      And the "Full name" field should contain "John"
      And the "Email" field should contain "john@acme.com"
    When I fill in "Email" with ""
      And I press "Update"
    Then I should see the following error messages:
      | Email can't be blank              |
      | Current password can't be blank   |
    When I fill in "Full name" with "Michael"
      And I fill in "Email" with "michael@acme.com"
      And I fill in "Password" with "new_password"
      And I fill in "Current password" with "password"
      And I press "Update"
    Then I should see the following error messages:
      | Password doesn't match confirmation |
    When I fill in "Password" with "new_password"
      And I fill in "Password confirmation" with "new_password"
      And I fill in "Current password" with "password"
      And I press "Update"
    Then I should see "Your settings have been updated"
    When I sign out
      And I follow "Log in"
      And I fill in "Email" with "michael@acme.com"
      And I fill in "Password" with "new_password"
      And I press "Log in"
    Then I should see the notice "Signed in successfully"
