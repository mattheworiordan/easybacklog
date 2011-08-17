Feature: Backlog
  In order to manage my themes and stories
  A visitor
  Should be able to set up and edit a backlog

  Scenario: Create a new backlog
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      And a standard backlog named "Acme Backlog" is set up for "Acme"
    When I am on the companies page
    Then I should see the page title "Acme"

    When I follow "Create a new backlog"
      And I press "Create new backlog"
    Then I should see the following error messages:
      | Name can't be blank             |
      # Check that default values are being used from Company
      And the "Use the 50/90 estimation method" checkbox should be checked
      And the "Rate" field should contain "800"
      And the "Velocity" field should contain "3"
    When I fill in "Backlog name" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

    When I follow "Back to dashboard"
      And I should see "Project X"

    When I follow "Duplicate"
      And I fill in "New backlog name" with "Project Y"
      And I press "Duplicate backlog"
    Then I should see the notice "Backlog was duplicated successfully."
    When I follow "Back to dashboard"
    Then I should see "Project Y"

  @javascript
  Scenario: Delete backlog
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      And a standard backlog named "Acme Backlog" is set up for "Acme"
    When I am on the companies page
      Then I should see the page title "Acme"
      And I should see "Acme Backlog"
    When I follow "Delete"
      And I press "Delete" within ".ui-dialog"
    Then I should see the notice "Backlog was successfully deleted."
    And I should not see "Acme Backlog"

  @javascript
  Scenario: Edit backlog AJAX properties
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      And a standard backlog named "Backlog-2" is set up for "Acme"
    When I am on the companies page
      And I follow "Backlog-2"
      And I change the editable text "Backlog-2" within tag "h2" to "Project Renamed"
      And I follow "Back to dashboard"
    Then I should see "Project Renamed"