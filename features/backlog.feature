Feature: Backlog
  In order to manage my themes and stories
  A visitor
  Should be able to set up and edit a backlog

  Scenario: Create a new backlog
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      And a standard backlog is set up for "Acme"
    When I am on the companies page
    Then I should see the page title "Acme"

    When I follow "Create a new backlog"
      And I press "Create new backlog"
    Then I should see the following error messages:
      | Name can't be blank             |
    When I fill in "Backlog name" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

    When I follow "Back to backlogs"
      And I should see "Project X"

    When I follow "Duplicate"
      And I fill in "New backlog name" with "Project Y"
      And I press "Duplicate backlog"
    Then I should see the notice "Backlog was duplicated successfully."
    When I follow "Back to backlogs"
    Then I should see "Project Y"

    When I follow "Delete"
      And I follow "Delete"
    Then I should see the notice "Backlog was successfully deleted."
    And I should not see "Project X"
      And I should not see "Project Y"

  @javascript
  Scenario: Edit backlog AJAX properties
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      And a standard backlog is set up for "Acme"
    When I am on the companies page
      And I follow "Backlog-1"
      And I change the editable text "Backlog-1" within tag "h2" to "Project Y"
      And I follow "Back to backlogs"
    Then I should see "Project Y"