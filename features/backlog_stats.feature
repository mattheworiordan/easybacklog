Feature: Backlog Stats
  In order to manage the progress being made in a backlog
  A user
  Should be able to view stats on their backlog

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"

  @javascript
  Scenario: Stats placeholder is shown
    Given a standard backlog named "Acme Backlog" is set up for "Acme"
      And I am on the backlog "Acme Backlog" page
    Then the "Stats backlog tab" should be visible
    When I click on the "Stats backlog tab"
    Then I should see the text "there are no statistics available" within the "stats tab area"
      And the "stats placeholder image" should be visible

  @javascript
  Scenario: Stats are visible
    Given a new example backlog is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    When I click on the "Stats backlog tab"
      And I wait 2 seconds
    Then I should see the text "1" within "average velocity per day"
      And I should see the text "5" within "average velocity per sprint"
      And I should see the text "15" within "expected velocity per sprint"
      And the "burn down chart" should be visible
      And the "burn up chart" should be visible
      And the "velocity chart" should be visible
      And the actual completed velocity in the stats JSON for backlog "Cucumber example backlog" should be 2 for sprint 1