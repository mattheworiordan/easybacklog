Feature: Backlog
  In order to manage my themes and stories
  A visitor
  Should be able to set up and edit a backlog

  Background:
    Given the standard locales are set up
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
    When I fill in "Backlog name" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

    When I follow "Back to dashboard"
      And I should see "Project X" within the "backlog list"

    When I follow "Duplicate"
      And I fill in "New backlog name" with "Project Y"
      And I press "Duplicate backlog"
    Then I should see the notice "Backlog was duplicated successfully."
    When I follow "Back to dashboard"
    Then I should see "Project Y" within the "backlog list"

  @javascript
  Scenario: Delete backlog
    Then I should see "Acme Backlog"
    When I follow "Delete"
      And I press "Delete" within "a dialog"
    Then I should see the notice "Backlog was successfully deleted."
    And I should not see "Acme Backlog"

  @javascript
  Scenario: Edit backlog AJAX properties
    When I follow "Acme Backlog"
      And I change the editable text "Acme Backlog" within "backlog heading" to "Project Renamed"
      And I tab forwards
      And I wait for AJAX for 0.75 seconds
      And I follow "Back to dashboard"
    Then I should see "Project Renamed" within the "backlog list"