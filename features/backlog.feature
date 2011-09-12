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
    When I fill in "Name the backlog" with "Project X"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

    When I follow "← Back to dashboard"
      And I should see "Project X" within the "backlog list"

    When I follow "Duplicate"
      And I fill in "New backlog name" with "Project Y"
      And I press "Duplicate backlog"
    Then I should see the notice "Backlog was duplicated successfully."
    When I follow "← Back to dashboard"
    Then I should see "Project Y" within the "backlog list"

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
    When I follow "Backlog Settings"
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
    When I follow "Backlog Settings"
    Then the "No, this is an internal project" checkbox should not be checked
      And the "Yes, I would like to assign this to a client" checkbox should be checked
      And "New company" should be selected for "new backlog company drop down"
      And the "Rate" field should contain "200"
      And the "Velocity" field should contain "1"
      And the "Use the 50/90 estimation method" checkbox should be checked

    # now check that companies are showing in the dashboard and backlog list
    When I follow "← Back to Backlog"
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
    When I follow "Delete"
      And I press "Delete" within "a dialog"
    Then I should see the notice "Backlog was successfully deleted."
    And I should not see "Acme Backlog"