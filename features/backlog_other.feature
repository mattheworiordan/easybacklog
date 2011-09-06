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
  Scenario: Check that snapshots work