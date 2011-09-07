Feature: Backlog Other Functionality
  In order to manage a backlog
  A visitor
  Should be able to rely on some necessary functionality

  Background:
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
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
  Scenario: Check that create and view snapshots works
    When I click on the "add snapshot button"
      And I fill in "Please name your snapshot:" with "Snapshot 1"
      And I press "Create Snapshot" within "the dialog"
      And I wait for 2 seconds
    Then I should see the notice "New snapshot created"
    Then "Working version (current)" should be selected for "snapshot drop down"
    When I select "Snapshot 1" from "Snapshot:"
      And I wait 1 second
    Then "Snapshot 1" should be selected for "snapshot drop down"
      And there should be 1 "snapshot icon"
      And there should be 0 "add theme buttons"
      And there should be 0 "add story buttons"
      And there should be 0 "delete theme buttons"
    When I click on the "first theme's name"
    Then there should be 0 "editable text fields"

  @javascript
  Scenario: Check that compare snapshots works
    When I change the editable text "[edit]" within the "first story's 50 score within the first theme" to "1"
      And I change the editable text "[edit]" within the "first story's 90 score within the first theme" to "13"
      And I change the editable text "Find stuff" within the "first story's so I can field within the first theme" to "base value"
      And I tab forwards and wait for AJAX
      And I click on the "add snapshot button"
      And I fill in "Please name your snapshot:" with "Snapshot 1"
      And I press "Create Snapshot" within "the dialog"
    Then I should see the notice "New snapshot created"
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
    When I click on the "compare snapshot button"
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
    Then I should see "TH11" within row 3, column 2 of the first table
      And I should see "As Story 1" within row 3, column 3 of the first table
      And I should see "Total for theme 'Theme 1'" within row 5, column 1 of the first table
      And I should see "0.0 days" within row 12, column 2 of the first table

  Scenario: Export snapshot
    Given a snapshot called "Snapshot 1" exists for backlog "Backlog 1"
    When I am on the snapshot base "Snapshot 1" and backlog "Backlog 1" Excel export page
    Then I should see "TH11" within row 5, column 1 of the first table
      And I should see "As Story 1" within row 5, column 2 of the first table
      And I should see "TH11" within row 5, column 9 of the first table