Feature: Backlog Other Functionality
  In order to manage a backlog
  A visitor
  Should be able to rely on some necessary functionality

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"
      # Backlog has rate of £800 and velocity of 3 by default
      # create two themes, Theme 1, Theme 2, with 2 stories in each
      And a backlog named "Backlog 1" with 2 themes and 2 stories in each theme is set up for "Acme"
      And I am on the backlog "Backlog 1" page

  @javascript
  Scenario: Check that totals for Theme, Story and Backlog add up
    When I change the editable text "[edit]" within the "first story's 50 score within the first theme" to "1"
      And I change the editable text "[edit]" within the "first story's 90 score within the first theme" to "3"
      And I tab forwards and wait for AJAX
    Then I should see "£644" within the "first story's cost within the first theme"
      And I should see "0.8" within the "first story's days within the first theme"
      And I should see "1.0 day" within the "first theme's totals"
      And I should see "£800" within the "first theme's totals"
      And I should see "1.0 day" within the "backlog totals"
      And I should see "£800" within the "backlog totals"
    When I change the editable text "[edit]" within the "second story's 50 score within the first theme" to "3"
      And I change the editable text "[edit]" within the "second story's 90 score within the first theme" to "5"
      And I tab forwards and wait for AJAX
    Then I should see "2.3 days" within the "first theme's totals"
      And I should see "£1,821" within the "first theme's totals"
      And I should see "2.3 days" within the "backlog totals"
      And I should see "£1,821" within the "backlog totals"
    When I change the editable text "[edit]" within the "second story's 50 score within the second theme" to "8"
      And I change the editable text "[edit]" within the "second story's 90 score within the second theme" to "13"
      And I tab forwards and wait for AJAX
    Then I should see "4.3 days" within the "second theme's totals"
      And I should see "£3,467" within the "second theme's totals"
      And I should see "2.3 days" within the "first theme's totals"
      And I should see "£1,821" within the "first theme's totals"
      And I should see "6.6 days" within the "backlog totals"
      And I should see "£5,288" within the "backlog totals"
    When I change the editable text "1" within the "first story's 50 score within the first theme" to "2"
      And I change the editable text "3" within the "first story's 90 score within the first theme" to "5"
      And I tab forwards and wait for AJAX
    Then I should see "2.9 days" within the "first theme's totals"
      And I should see "£2,295" within the "first theme's totals"
      And I should see "7.2 days" within the "backlog totals"
      And I should see "£5,761" within the "backlog totals"
    When I change the editable text "8" within the "second story's 50 score within the second theme" to ""
      And I change the editable text "13" within the "second story's 90 score within the second theme" to ""
      And I tab forwards and wait for AJAX
    Then I should see "0.0 days" within the "second theme's totals"
      And I should see "£0" within the "second theme's totals"
      And I should see "2.9 days" within the "backlog totals"
      And I should see "£2,295" within the "backlog totals"

  @javascript
  Scenario: Check that create, view and delete snapshots works
    When I click on the "snapshots menu"
      And I click on the "create new snapshot button"
      And I fill in "Please name your snapshot:" with "Snapshot 1"
      And I press "Create Snapshot" within "the dialog"
    Then I should see the notice "New snapshot being created"
    When I click on the "snapshots menu"
    Then "Working version (current)" should be selected for "snapshot drop down within snapshots menu"
    When I select "Snapshot 1" from "Select a snapshot to view:"
      And I wait 1 second
      And click on the "snapshots menu"
    Then "Snapshot 1" should be selected for "snapshot drop down appearing in snapshot mode near tabs"
      And "Snapshot 1" should be selected for "snapshot drop down within snapshots menu"
      And there should be 1 "snapshot icon"
      And there should be 0 "add theme buttons"
      And there should be 0 "add story buttons"
      And there should be 0 "delete theme buttons"
    When I click on the "first theme's name"
    Then there should be 0 "editable text fields"
    # now make sure the new snapshot selector which only appears in snapshot mode works
    When I select "Working version (current)" from "Viewing snapshot:"
      And I wait 1 second
      Then there should be 0 "snapshot icons"
    When I click on the "snapshots menu"
      And I select "Snapshot 1" from "Select a snapshot to view:"
      And I wait 1 second
    Then "Snapshot 1" should be selected for "snapshot drop down appearing in snapshot mode near tabs"
    When I follow "Settings"
    Then I should see "Snapshot name" within a "label"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled
    When I follow "Yes, I understand — delete this snapshot"
      And I press "Delete" within "a dialog"
    Then I should see the notice "Snapshot was successfully deleted"
    When I click on the "snapshots menu"
    Then there should be 0 "drop down options with the text Snapshot 1"

  @javascript
  Scenario: Check that compare snapshots works
    When I change the editable text "[edit]" within the "first story's 50 score within the first theme" to "1"
      And I change the editable text "[edit]" within the "first story's 90 score within the first theme" to "13"
      And I change the editable text "Find stuff" within the "first story's so I can field within the first theme" to "base value"
      And I tab forwards and wait for AJAX
      When I click on the "snapshots menu"
      And I click on the "create new snapshot button"
      And I fill in "Please name your snapshot:" with "Snapshot 1"
      And I press "Create Snapshot" within "the dialog"
    Then I should see the notice "New snapshot being created"
    When I change the editable text "1" within the "first story's 50 score within the first theme" to "3"
      And I change the editable text "13" within the "first story's 90 score within the first theme" to "5"
      And I change the editable text "base value" within the "first story's so I can field within the first theme" to "new value"
      And I click on the "second story's delete within the first theme"
      And I press "Delete" within "the dialog"
      And I wait for 0.5 seconds
      And I click on the "second theme's add story button"
      And I wait for 0.5 seconds
      And I change the current editable text to "new story"
      And I tab forwards and wait for AJAX
    When I click on the "snapshots menu"
      And I click on the "compare snapshots button"
      And I select "Snapshot 1" from "Which snapshot is your base (typically the older version)?"
      And I press "Compare" within "the dialog"
      And I wait 3 seconds
    Then I should see the text "So I can base value" within a "changed base user story value"
      And I should see the text "So I can new value" within a "changed target user story value"
      And there should be 1 "snapshot deleted row"
      And there should be 1 "snapshot added row"
      And there should be 5 "snapshot modified or identical rows"

  Scenario: Export backlog
    When I follow "Export"
    Then I should see "TH11" within row 3, cell 2 of the first worksheet
      And I should see "As Story 1" within row 3, cell 3 of the first worksheet
      And I should see "Total for theme 'Theme 1'" within row 5, cell 1 of the first worksheet
      And I should see "0.0 days" within row 11, cell 2 of the first worksheet
      And I should see "Cost" within row 2, cell 10 of the first worksheet
      And I should see "Days" within row 2, cell 11 of the first worksheet

  Scenario: Export backlog with costs and points disabled
    When I follow "Settings"
      And I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I press "Update backlog settings"
      And I follow "Export"
    Then I should not see "Cost" within row 2, cell 10 of the first worksheet
    And I should not see "Days" within row 2, cell 11 of the first worksheet

  Scenario: Export backlog with costs disabled
    When I follow "Settings"
      And I fill in "Rate (optional)" with ""
      And I press "Update backlog settings"
      And I follow "Export"
    Then I should not see "Cost" within row 2, cell 10 of the first worksheet
    And I should see "Days" within row 2, cell 10 of the first worksheet

  Scenario: Export snapshot
    Given a snapshot called "Snapshot 1" exists for backlog "Backlog 1"
    When I am on the snapshot base "Snapshot 1" and backlog "Backlog 1" Excel export page
    Then I should see "TH11" within row 6, column 1 of the first table
      And I should see "As Story 1" within row 6, column 2 of the first table
      And I should see "TH11" within row 6, column 9 of the first table
      And I should see "Cost" within row 4, column 7 of the first table
      And I should see "Days" within row 4, column 8 of the first table

  Scenario: Export snapshot with costs and points disabled
    When I follow "Settings"
      And I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I press "Update backlog settings"
    Given a snapshot called "Snapshot 1" exists for backlog "Backlog 1"
    When I am on the snapshot base "Snapshot 1" and backlog "Backlog 1" Excel export page
    Then I should not see "Cost" within row 4, column 7 of the first table
    And I should not see "Days" within row 4, column 7 of the first table

  Scenario: Export snapshot with costs disabled
    When I follow "Settings"
      And I fill in "Rate (optional)" with ""
      And I press "Update backlog settings"
    Given a snapshot called "Snapshot 1" exists for backlog "Backlog 1"
    When I am on the snapshot base "Snapshot 1" and backlog "Backlog 1" Excel export page
    Then I should not see "Cost" within row 4, column 7 of the first table
    And I should see "Days" within row 4, column 7 of the first table

  Scenario: Export PDF cards
    When I follow the PDF link "Print"
    Then I should see "TH11"
      And I should see "AsStory 1"
      And I should see "AsStory 2"
      And I should see "Backlog: Backlog 1"
      And I should see "Theme: Theme 1"

  @javascript
  Scenario: Print shows sprints and themes
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    When I follow "Print"
    Then the "print story cards dialog" should be visible
      And "Sprint 1" should be an option for the "print story card dialog scope drop down"
      And "Sprint 2" should be an option for the "print story card dialog scope drop down"
      And "Theme 1" should be an option for the "print story card dialog scope drop down"

  @javascript
  Scenario: Snapshot settings for sprints must work and should not be editable
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    When I click on the "snapshots menu"
      And I select "Sprint 1" from "Select a snapshot to view:"
      And I wait 1 second
    Then "Sprint 1" should be selected for "snapshot drop down appearing in snapshot mode near tabs"
    When I follow "Settings"
    Then the "backlog_name" disabled field should contain "Sprint 1"
      And the "text input fields" should be disabled
      And the "checkboxes" should be disabled
      And the "radio buttons" should be disabled
      And I should see the text "You cannot delete a sprint snapshot"

  @javascript
  Scenario: Allow backlog locale to be set as default (inherit) or set explicitly, and language and currency must update
    When I am on the accounts page
    When I follow "Backlog 1"
      And I follow "Settings"
    Then I should see the page title "Backlog settings"
      # locale for new accounts defaults to British English in Cucumber environment
      And "Use default British English..." should be selected for "What is your preferred language setting?"
    When I follow "← Back"
    Then I should see the text "£" within "backlog totals"
      And I should see the text "Backlog total" within "backlog stats"
      And I should see "£" within the "first story's cost"
    When I follow "Settings"
    Then I should see the page title "Backlog settings"
    When I select "France French" from "What is your preferred language setting?"
      And I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
      And I should see the text "€" within "backlog totals"
      And I should see the text "Total du backlog" within "backlog stats"
      And I should see "€" within the "first story's cost"
      And I should see the text "Thème"
