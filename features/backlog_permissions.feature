Feature: Backlog Permissions
  In order to ensure account users can control who can edit or view their backlogs
  A visitor
  Should be able to set up permissions for a backlog

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"

  @javascript
  Scenario: User is assigned read only writes to the example backlog and is shown suitable notices when he/she tries to edit the backlog
    Given an account called "Acme" is set up for "John" who should have read only rights
      And an example backlog for testing is set up for the account "Acme"
      And a standard backlog named "Empty backlog" is set up for "Acme"
      And I am on the accounts page
    Then I should not see "Create a new backlog"
      And I should see "Cucumber example backlog"
    When I follow "Cucumber example backlog"
    Then I should see the page title "Cucumber example backlog"
      And the "first theme's name" should not be editable to this user
      And the "first story's as field within the second theme" should not be editable to this user
      And the "first theme's add story button" should not be visible
      And the "add theme button" should not be visible
    When I click on the "first story's status tab within the first theme"
    Then I should see the warning "You do not have permission to update the status of stories for this backlog"
    When I click on the "snapshots menu"
    Then the "create new snapshot button" should not be visible
    When I click on "3 backlog tab"
    Then I should see "You cannot assign any stories to sprints"
      And I should not see "Mark sprint as complete"
      And I should not see "move all incomplete stories"
    When I follow "Settings"
    And I click on "Backlog backlog tab"
    Then I should see "Please note that you do not have permission to edit the settings of this backlog and can only view them"
      And I should see "Backlog read only"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled
    When I click on "3 backlog tab"
    Then I should see "Sprint read-only"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled
    When I am on the accounts page
      And I follow "Empty backlog"
      And I click on "Sprints backlog tab"
    Then I should not see "Create new sprint"
      And the "add sprint button" should not be visible
      And I should see "Sprints not editable"

  @javascript
  Scenario: User is assigned no writes to a backlog and should not see any backlogs
    Given an account called "Acme" is set up for "John" who should have no rights
      And a standard backlog named "Empty backlog" is set up for "Acme"
      And I am on the accounts page
    Then I should not see "Empty backlog"
      And I should not see "Create a new backlog"
      And I should see "You do not have access to any backlogs in this account."

  @javascript
  Scenario: User is assigned read and status update rights to a backlog and should be shown suitable notices when editing the backlog, but should be able to edit the status of stories
    Given an account called "Acme" is set up for "John" who should have read only and status update rights
      And an example backlog for testing is set up for the account "Acme"
      And a standard backlog named "Empty backlog" is set up for "Acme"
      And I am on the accounts page
    Then I should not see "Create a new backlog"
      And I should see "Cucumber example backlog"
    When I follow "Cucumber example backlog"
    Then I should see the page title "Cucumber example backlog"
      And the "first theme's name" should not be editable to this user
      And the "first story's as field within the second theme" should not be editable to this user
      And the "first theme's add story button" should not be visible
      And the "add theme button" should not be visible
    When I click on the "first story's status tab within the first theme"
    Then I should not see the warning "You do not have permission to update the status of stories for this backlog"
    When I click on the "snapshots menu"
    Then the "create new snapshot button" should not be visible
    When I click on "3 backlog tab"
    Then I should see "You cannot assign any stories to sprints"
      And I should not see "Mark sprint as complete"
      And I should not see "move all incomplete stories"
    When I follow "Settings"
    And I click on "Backlog backlog tab"
    Then I should see "Please note that you do not have permission to edit the settings of this backlog and can only view them"
      And I should see "Backlog read only"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled
    When I click on "3 backlog tab"
    Then I should see "Sprint read-only"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled
    When I am on the accounts page
      And I follow "Empty backlog"
      And I click on "Sprints backlog tab"
    Then I should not see "Create new sprint"
      And the "add sprint button" should not be visible
      And I should see "Sprints not editable"

  @javascript
  Scenario: User has full access rights
    Given an account called "Acme" is set up for "John" who should have full access rights
      And an example backlog for testing is set up for the account "Acme"
      And a standard backlog named "Empty backlog" is set up for "Acme"
      And I am on the accounts page
    Then I should see "Create a new backlog"
      And I should see "Cucumber example backlog"
    When I follow "Cucumber example backlog"
    Then I should see the page title "Cucumber example backlog"
      And the "first theme's name" should be editable to this user
      And the "first story's as field within the second theme" should be editable to this user
      And the "first theme's add story button" should be visible
      And the "add theme button" should be visible
    When I click on the "first story's status tab within the first theme"
    Then I should not see the warning "You do not have permission to update the status of stories for this backlog"
    When I click on the "snapshots menu"
    Then the "create new snapshot button" should be visible
    When I click on "3 backlog tab"
    Then I should not see "You cannot assign any stories to sprints"
      And I should see "Mark sprint as complete"
      And I should see "move all incomplete stories"
    When I follow "Settings"
    And I click on "Backlog backlog tab"
    Then I should not see "Please note that you do not have permission to edit the settings of this backlog and can only view them"
      And I should see "Duplicate backlog"
      And the "text input fields" should not be disabled
      And the "checkboxes" should not be disabled
      And the "radio buttons" should not be disabled
    When I click on "3 backlog tab"
    Then I should not see "Sprint read-only"
      And the "text input fields" should not be disabled
      And the "checkboxes" should not be disabled
      And the "radio buttons" should not be disabled
    When I am on the accounts page
      And I follow "Empty backlog"
      And I click on "Sprints backlog tab"
    Then I should see "Create new sprint"
      And the "add sprint button" should be visible
      And I should not see "Sprints not editable"

  @javascript
  Scenario: No access user is given read privileges for the company so should see the company backlogs but not change the company settings
    Given an account called "Acme" is set up for "John" who should have account admin rights
      And a backlog named "Backlog for test" assigned to company "Microsoft" for account "Acme" is set up
      And a user named "Mike company read access" is created with no rights and assigned to account "Acme"
      And a user named "Z no company access" is created with no rights and assigned to account "Acme"
      And I am on the accounts page
    When I follow "Microsoft"
      And I follow "Manage company users"
      And I select "Read only access to this company" from "Mike company read access"
      And I wait 1 second
      And I follow "Acme" within "top nav"
      And I follow "Backlog for test"
      And I follow "Settings"
      And I follow "Manage backlog users"
    Then I should see "Users for backlog Backlog for test"
      And I should see the following data in column 1 of "account user table" table:
        | John                      |
        | Mike company read access  |
        | Z no company access               |
      And I should see the following data in column 3 of "account user table" table:
        | Administrator access to all features |
        |                                      |
        |                                      |
      And "Read only access (inherited)" should be selected for "Mike company read access"
      And "No access (inherited)" should be selected for "Z no company access"
    When I select "No access to this backlog" from "Mike company read access"
      And I select "Read only access to this backlog" from "Z no company access"
      And I sign out
      And I am signed in as "Mike company read access"
    # Mike company read access should not see anything as his company rights have been explicitly overwritten
    Then I should not see "Microsoft"
      And I should not see "Backlog for test"
    When I sign out
      And I am signed in as "Z no company access"
    Then I should see "Microsoft" within "your side panel"
      And I should see "Backlog for test"
    When I follow "Backlog for test"
      And I follow "Settings"
    Then the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled

  @javascript
  Scenario: No access user is given full privileges for the backlog so should see the backlogs and be allowed to edit the settings
    Given an account called "Acme" is set up for "John" who should have account admin rights
      And a backlog named "Backlog for test" assigned to company "Microsoft" for account "Acme" is set up
      And a user named "Mike no access" is created with no rights and assigned to account "Acme"
      And I am on the accounts page
    When I follow "Backlog for test"
      And I follow "Settings"
      And I follow "Manage backlog users"
    Then I should see "Users for backlog Backlog for test"
      And "No access (inherited)" should be selected for "Mike no access"
    When I select "Full access to this backlog" from "Mike no access"
      And I wait 1 second
      And I sign out
      And I am signed in as "Mike no access"
    # Mike no access should see the company and its backlog
    Then I should see "Microsoft" within "your side panel"
      And I should see "Backlog for test"
      # whilst he can edit the backlog, he should not be able to edit the company
      And within the "dashboard company or account fields" there should not be a clickable element with the text "Microsoft"
      And within "your side panel" there should not be a clickable element with the text "Microsoft"
      And I should not see "Create a new backlog"
    When I follow "Backlog for test"
      And I follow "Settings"
    Then the "text input fields" should not be disabled
      And the "checkboxes" should not be disabled
      And the "radio buttons" should not be disabled