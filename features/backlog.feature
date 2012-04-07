Feature: Backlog
  In order to manage my themes and stories
  A visitor
  Should be able to set up and edit a backlog

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"
      And a standard backlog named "Acme Backlog" is set up for "Acme"
    When I am on the accounts page
      Then I should see the page title "Acme"

  Scenario: Create a new backlog
    When I follow "Create a new backlog"
      And I press "Create new backlog"
    Then I should see the following error messages:
      | Name can't be blank             |
      # Check that default values are being used from Account
      And the "Use the 50/90 estimation method" checkbox should be checked
      And the "Rate" field should contain "800"
      And the "Velocity" field should contain "3"
      And the "Modified Fibonacci" checkbox should be checked
    When I fill in "Name the backlog" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

    When I follow "← Back to dashboard"
      And I should see "Project X" within the "backlog list"

  @javascript
  Scenario: Duplicate a backlog
    When I follow "Create a new backlog"
      And I fill in "Name the backlog" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

    When I follow "← Back to dashboard"
      And I should see "Project X" within the "backlog list"

    # now check that duplicate works, but assign a company too to ensure that copies across
    When I follow "Project X"
      And I follow "Settings"
      And I choose "Yes, I would like to assign this to a client"
      # no companies exist yet, so don't give the user an option to select a company
    Then the focus is on the "new backlog new company field"
    When I fill in "New company name" with "Separate company"
      And I press "Update backlog settings"
    And I should see "Separate company" within "backlog company"
    When I follow "Settings"
      And I follow "Duplicate backlog"
      And I fill in "New backlog name" with "Project X Duplicate"
      And I press "Duplicate backlog"
    Then I should see the notice "Backlog was duplicated successfully."
    When I follow "← Back to dashboard"
    Then I should see "Project X Duplicate" within the "backlog list"
      And I should see "Project X" within the "backlog list"
    When I follow "Project X Duplicate"
      And I follow "Settings"
    Then "Separate company" should be selected for the "backlog setting company drop down"

  @javascript
  Scenario: Create backlog with company and make sure defaults are used and update settings
    When I follow "Create a new backlog"
    Then the "No, this is an internal project" checkbox should be checked
    When I choose "Yes, I would like to assign this to a client"
    # no companies exist yet, so don't give the user an option to select a company
    Then the "new backlog company drop down" should not be visible
      And the "new backlog new company field" should be visible
      And the focus is on the "new backlog new company field"
    When I fill in "New company name" with "Company cheap"
      And I fill in "Name the backlog" with "Cheap backlog"
      And I fill in "Rate" with "400"
      And I fill in "Velocity" with "2"
      And I uncheck "Use the 50/90 estimation method"
      And I press "Create new backlog"
    Then I should see "Cheap backlog" within "backlog heading"
      And I should see "Company cheap" within "backlog company"

    # now create a backlog with no company
    When I follow "← Back to dashboard"
      And I follow "Create a new backlog"
      And I fill in "Name the backlog" with "No company backlog"
      And I press "Create new backlog"
    Then I should see "No company backlog" within "backlog heading"
      And I should see "Acme" within "backlog company"

    # now create a backlog with an existing company
    When I follow "← Back to dashboard"
      And I follow "Create a new backlog"
    Then the "No, this is an internal project" checkbox should be checked
      And the "Rate" field should contain "800"
      And the "Velocity" field should contain "3"
      And the "Use the 50/90 estimation method" checkbox should be checked
    When I choose "Yes, I would like to assign this to a client"
    Then the "new backlog company drop down" should be visible
      And the "new backlog new company field" should not be visible
      And "Company cheap" should be selected for "new backlog company drop down"
    # wait for AJAX request to get company settings from selected company set above
    When I wait 1 second
    Then the "Rate" field should contain "400"
      And the "Velocity" field should contain "2"
      And the "Use the 50/90 estimation method" checkbox should not be checked
    When I fill in "Name the backlog" with "Cheap 2nd backlog"
      And I press "Create new backlog"
    Then I should see "Cheap 2nd backlog" within "backlog heading"
      And I should see "Company cheap" within "backlog company"

    # go into Backlog settings and add a new company and change all settings
    When I follow "Settings"
    Then the "No, this is an internal project" checkbox should not be checked
      And the "Yes, I would like to assign this to a client" checkbox should be checked
    When I fill in "Name the backlog" with "New backlog name"
      And I follow "add a new company"
      And I fill in "New company name" with "New company"
      And I fill in "Rate" with "200"
      And I fill in "Velocity" with "1"
      And I check "Use the 50/90 estimation method"
      And I press "Update backlog"
    Then I should see "New backlog name" within "backlog heading"
      And I should see "New company" within "backlog company"
    When I follow "Settings"
    Then the "No, this is an internal project" checkbox should not be checked
      And the "Yes, I would like to assign this to a client" checkbox should be checked
      And "New company" should be selected for "new backlog company drop down"
      And the "Rate" field should contain "200"
      And the "Velocity" field should contain "1"
      And the "Use the 50/90 estimation method" checkbox should be checked

    # now check that companies are showing in the dashboard and backlog list
    When I follow "← Back to backlog"
    When I follow "← Back to dashboard"
    # check that backlog dashboard page is in order of date desc, and company headings are showing
    Then I should see the text "New company" within the "first company heading in a dashboard list"
      And I should see the text "New backlog name" within the "first backlog list in a dashboard list"
    Then I should see the text "Company cheap" within the "third company heading in a dashboard list"
      And I should see the text "Cheap backlog" within the "third backlog list in a dashboard list"
    # check that your backlog list is in alphabetical order except for backlogs unassigned to a company
    Then I should see the text "Acme" within the "first company heading in your backlog list"
      And I should see the text "Acme Backlog" within the "first backlog list in your backlog list"
      And I should see the text "No company backlog" within the "first backlog list in your backlog list"
    Then I should see the text "New company" within the "third company heading in your backlog list"
      And I should see the text "New backlog name" within the "third backlog list in your backlog list"

  @javascript
  Scenario: Delete backlog
    Then I should see "Acme Backlog"
    When I follow "Acme Backlog"
      And I follow "Settings"
      And I follow "Yes, I understand — delete this backlog"
      And I press "Delete" within "a dialog"
    Then I should see the notice "Backlog was successfully deleted."
    And I should not see "Acme Backlog"

  @javascript
  Scenario: Archive backlogs
    When I follow "Acme Backlog"
      And I follow "Settings"
      And I choose "Archived — This backlog is locked: it can be viewed but not edited"
      And I press "Update backlog settings"
    Then I should see the notice "Backlog is now archived"
    # ensure it's not editable
    When I click on the "first theme's name"
    Then there should be 0 "editable text fields"
    When I click on "Sprints backlog tab"
    Then I should not see "Create new sprint"
      And I should not see "add sprint button"
      And I should see "Sprints locked"
    When I follow "Settings"
    Then I should see "This backlog is archived and is not editable." within the "non editable notice"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
    When I choose "Active — Fully functional backlog"
      And I press "Update backlog archive status"
    Then I should see the notice "Backlog has been restored from archive and is now active"
    When I click on the "first theme's name"
    Then there should be 1 "editable text fields"

  @javascript
  Scenario: Hide accepted stories
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the accounts page
    When I follow "Cucumber example backlog"
    Then I should see the page title "Cucumber example backlog"
      Then there should be 3 "accepted stories"
      And there should be 4 "assigned to sprint stories"
    When I hover over the "filter menu"
      And I check "Hide accepted stories"
      And I wait for AJAX for 1 second
    Then there should be 0 "accepted stories"
      And there should be 1 "assigned to sprint story"
      And the "filter notifier" should be visible
    When I follow "Remove filter"
      And I wait for AJAX for 1 second
    Then there should be 3 "accepted stories"
      And there should be 4 "assigned to sprint stories"
      And the "filter notifier" should not be visible

  @javascript
  Scenario: Hide assigned stories
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the accounts page
    When I follow "Cucumber example backlog"
    Then I should see the page title "Cucumber example backlog"
      Then there should be 3 "accepted stories"
      And there should be 4 "assigned to sprint stories"
    When I hover over the "filter menu"
      And I check "Hide stories assigned to sprints"
      And I wait for AJAX for 1 second
    Then there should be 0 "accepted stories"
      And there should be 0 "assigned to sprint stories"
      And the "filter notifier" should be visible
    When I hover over the "filter menu"
      And I check "Hide accepted stories"
      And I wait for AJAX for 1 second
    Then the "Hide stories assigned to sprints" checkbox should not be checked
      And there should be 0 "accepted stories"
      And there should be 1 "assigned to sprint story"
      And the "filter notifier" should be visible

  @javascript
  Scenario: Remember filter preferences for this user
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    Then there should be 3 "accepted stories"
      And there should be 4 "assigned to sprint stories"
    When I hover over the "filter menu"
      And I check "Hide stories assigned to sprints"
      And I wait for AJAX for 1 second
    Then there should be 0 "accepted stories"
      And there should be 0 "assigned to sprint stories"
      And the "filter notifier" should be visible
    When I am on the accounts page
      And I am on the backlog "Cucumber example backlog" page
      And I wait for AJAX for 1 second
    Then there should be 0 "accepted stories"
      And there should be 0 "assigned to sprint stories"
      And the "filter notifier" should be visible

  @javascript
  Scenario: Create new backlog without rate and velocity and ensure days and costs are not visible
    When I follow "Create a new backlog"
      # ensure By default text not showing for a backlog as shared partial
      Then I should see "Would you like to have"
    When I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I fill in "Name the backlog" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."
    When I follow "Add theme"
      And I wait for 0.25 seconds
    When I change the current editable text to "First"
      And I tab forwards and wait for AJAX to update
    Then the focussed element should have the text "Add story"
    When I press enter and wait for AJAX
    Then the focussed element should be an editable text field
    When I tab forwards 5 times
      And I change the current editable text to "5"
      And I tab forwards and wait for AJAX
    And I should see "5" within the "first story's 50 score"
      And the "first story's days" should not be visible
      And the "first story's cost" should not be visible
      And I should see "5.0 points" within the "backlog totals"
      And I should not see "days" within the "backlog totals"
      And I should not see "£" within the "backlog totals"
    # now enable days, check validation on settings form, and ensure day estimation fields are shown
    When I follow "Settings"
    Then the "No, I'd prefer to estimate once I set up my first iteration and defined the velocity" checkbox should be checked
    When I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
    And I press "Update backlog settings"
    Then I should see "This field is required"
    When I fill in "Velocity" with "aa"
    Then I should see "Please enter a valid number"
    When I fill in "Velocity" with "3"
    Then I should not see "Please enter a valid number"
      And I should not see "This field is required"
    When I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
      And the "first story's days" should be visible
      And the "first story's cost" should not be visible
      And I should see "days" within the "backlog totals"
      And I should not see "£" within the "backlog totals"
    # now enable costs and ensure all cost & days estimation fields appear
    When I follow "Settings"
    Then the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked
    When I fill in "Rate (optional)" with "aa"
    Then I should see "Please enter a valid number"
    When I fill in "Rate (optional)" with "300"
    Then I should not see "Please enter a valid number"
    When I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
      And the "first story's days" should be visible
      And the "first story's cost" should be visible
      And I should see "days" within the "backlog totals"
      And I should see "£" within the "backlog totals"

  @javascript
  Scenario: Check that company settings are remembered when creating a new backlog
    Given a backlog named "Backlog 1" assigned to company "Microsoft" for account "Acme" is set up
      And a backlog named "Backlog 2" assigned to company "Apple" for account "Acme" is set up
      And I am on the accounts page
    When I follow "Manage account"
      And I fill in "Velocity" with "1"
      And I fill in "Rate (optional)" with "2"
      And I press "Update account"
    Then I should see the page title "Acme"
    When I follow "Microsoft"
    Then I should see the page title "Company settings"
    When I fill in "Rate (optional)" with ""
      And I fill in "Velocity" with "3"
      And I press "Update company"
      And I wait for 0.2 seconds
    Then I should see the page title "Acme"
    When I follow "Apple"
    Then I should see the page title "Company settings"
    When I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I press "Update company"
      And I wait for 0.2 seconds
    Then I should see the page title "Acme"
    When I follow "Create a new backlog"
    Then the "Velocity" field should contain "1"
      And the "Rate (optional)" field should contain "2"
    When I choose "Yes, I would like to assign this to a client"
      And I select "Microsoft" from "Which company?"
      And I wait for AJAX for 1 second
    Then the "Velocity" field should contain "3"
      And the "Rate (optional)" field should contain ""
    When I select "Apple" from "Which company?"
      And I wait for AJAX for 1 second
    Then the "No, I'd prefer to estimate once I set up my first iteration and defined the velocity" checkbox should be checked
      And the "backlog velocity" should not be visible
      And the "backlog rate" should not be visible
    When I choose "No, this is an internal project"
    Then the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked
      And the "Velocity" field should contain "1"
      And the "Rate (optional)" field should contain "2"
      And the "backlog velocity" should be visible
      And the "backlog rate" should be visible

  @javascript
  Scenario: Check that account settings for a new blank account are remembered when creating a new backlog, and are then defaults are not overwritten
    Given I am on the new account page
    Then I should see the page title "Create a new account"
    When I fill in "Account Name" with "BP"
      And I select "British English" from "What is your preferred language setting?"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."
    When I follow "Create a new backlog"
      And I fill in "Name the backlog" with "Website"
      And I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
      And I fill in "Velocity" with "1"
      And I fill in "Rate (optional)" with "2"
      And I check "Use the 50/90 estimation method"
      And I choose "Strict Fibonacci"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."
    When I follow "← Back to dashboard"
    And I follow "Create a new backlog"
    Then the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked
      And the "Velocity" field should contain "1"
      And the "Rate (optional)" field should contain "2"
      And the "Use the 50/90 estimation method" checkbox should be checked
      And the "Strict Fibonacci" checkbox should be checked

    When I am on the new account page
    Then I should see the page title "Create a new account"
    When I fill in "Account Name" with "Shell"
      And I select "British English" from "What is your preferred language setting?"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."
    When I follow "Create a new backlog"
      And I fill in "Name the backlog" with "First website"
      And I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I uncheck "Use the 50/90 estimation method"
      And I choose "Anything"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."
    When I follow "← Back to dashboard"
    And I follow "Create a new backlog"
    Then the "No, I'd prefer to estimate once I set up my first iteration and defined the velocity" checkbox should be checked
      And the "Use the 50/90 estimation method" checkbox should not be checked
      And the "Anything" checkbox should be checked
    # now let's change the settings for this new backlog and ensure the original settings are retained
    When I fill in "Name the backlog" with "Second website"
      And I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
      And I fill in "Velocity" with "1"
      And I fill in "Rate (optional)" with "2"
      And I check "Use the 50/90 estimation method"
      And I choose "Strict Fibonacci"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."
    When I follow "← Back to dashboard"
      And I follow "Create a new backlog"
    Then the "No, I'd prefer to estimate once I set up my first iteration and defined the velocity" checkbox should be checked
      And the "Use the 50/90 estimation method" checkbox should not be checked
      And the "Anything" checkbox should be checked

  # change company settings and see what impact it has on defaults for rate & velocity when company selected, ensure both non estimateable and estimateable examples exist

  @javascript
  Scenario: Ensure that the first time a backlog is created with a new account, the estimatable fields are enabled by default
    Given I am on the new account page
    Then I should see the page title "Create a new account"
    When I fill in "Account Name" with "BP"
      And I select "British English" from "What is your preferred language setting?"
      And I press "Create new account"
    Then I should see the notice "Account was successfully created."
    When I follow "Create a new backlog"
    Then the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked