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