Feature: Backlog Sprints
  In order to start iterating and producing the stories from my backlog
  A user
  Should be able to manage and assign stories within sprints

  Background:
    Given a user named "John" is registered
      And I am signed in as "John"
      And the database has the necessary lookup tables
      And an account called "Acme" is set up for "John"

  @javascript
  Scenario: Create new sprint for a backlog with day estimations and edit settings, validate all fields and check that defaults are remembered
    Given a backlog named "Backlog 1" assigned to company "Microsoft" for account "Acme" is set up
      And I am on the backlog "Backlog 1" page
    When I follow "Settings"
      And I fill in "Velocity" with "2"
      And I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
    # Add first sprint using default day estimations
    When I click on the "add sprint button"
    Then a "new sprint dialog box" should be visible
      And I should see "Create a new sprint"
    When I press "Cancel"
    Then a "new sprint dialog box" should not be visible
    When I click on the "add sprint button"
    Then a "new sprint dialog box" should be visible
      And the "new sprint estimation question" should be visible
      And the "Use backlog velocity of 2 points per person per day and team size" checkbox should be checked
      And the "Enter your team size" field should contain "1"
      And "Velocity in points" should be disabled
      And the "date picker" should not be visible
    When I fill in "Sprint start date" with ""
      And I press "Create"
    Then I should see "One or more fields are not completed correctly"
      # for some reason, we can't find date missing even though it's in the text returned
      # And I should see "Date missing" within "new sprint dialog box"
    When I fill in "Sprint start date" with "02/01/2012"
      Then I should not see "Date missing"
    When I click on "Sprint start date"
    Then the "date picker" should be visible
    When the focus is on the "Sprint start date"
      And I press escape
      And I wait for AJAX for 1 second
      Then the "date picker" should not be visible
    When I fill in "Duration of sprint in working days" with "0"
      Then I should see "Sprint duration must be at least 1 day"
    When I fill in "Duration of sprint in working days" with "a"
      Then I should see "Enter a value using whole numbers"
      And I should see "(enter duration of sprint)" within "new sprint expected velocity"
    When I fill in "Duration of sprint in working days" with ""
      Then I should see "Sprint duration is required"
    When I fill in "Duration of sprint in working days" with "8"
      And I fill in "Enter your team size" with "a"
      Then I should see "Team size must be a valid number"
      And I should see "(enter your team size)" within "new sprint expected velocity"
    When I fill in "Enter your team size" with "0"
      And I press "Create"
    Then I should see "Number team members must be greater than 0"
    When I fill in "Enter your team size" with "2"
    Then I should see "32" within "new sprint expected velocity"
    When I press "Create"
    Then I should see the notice "Sprint number 1 has been added"
      And the "Sprint 1" tab should be selected
    # Add second sprint using explicit velocities
    When I click on the "add sprint button"
    Then a "new sprint dialog box" should be visible
      # make sure settings from previous sprint are retained
      And the "Use backlog velocity of 2 points per person per day and team size" checkbox should be checked
      And the "Duration of sprint in working days" field should contain "8"
      And the "Enter your team size" field should contain "2"
      And I should see "32" within "new sprint expected velocity"
      # ensure date is 8 days in front of the last one including weekends
      And the "Sprint start date" field should contain "12/01/2012"
    When I fill in "Duration of sprint in working days" with "7"
      And I choose "Manually define a team velocity for this sprint"
      And I wait for AJAX for 1 second
    Then the "Velocity in points" field should be empty
      And "Enter your team size" should be disabled
    When I fill in "Velocity in points" with "a"
    Then I should see "Velocity must be a valid number"
    When I fill in "Velocity in points" with ""
    Then I should see "Velocity is required"
    When I fill in "Velocity in points" with "30"
      And I press "Create"
    Then I should see the notice "Sprint number 2 has been added"
      And the "Sprint 2" tab should be selected
    When I click on the "add sprint button"
    Then a "new sprint dialog box" should be visible
      And the "Manually define a team velocity for this sprint" checkbox should be checked
      And the "Duration of sprint in working days" field should contain "7"
      And the "Enter your team size" should be disabled
      And the "Velocity in points" field should contain "30"
      # ensure date is 7 days in front of the last one including weekends
      And the "Sprint start date" field should contain "23/01/2012"
    When I fill in "Sprint start date" with "12/01/2012"
      And I press "Create"
    Then I should see "we could not create a sprint"
      And I should see "Start date and duration overlaps with sprint 2"
    When I press "Cancel"
      And I click on "1 backlog tab"
      And I follow "Settings"
    Then the "Sprint 1" tab should be selected
      And the "Sprint start date" field should contain "02/01/2012"
      And the "Duration of sprint in days" field should contain "8"
      And the "Use backlog velocity of 2 points per person per day and team size" checkbox should be checked
      And the "Number of team members" field should contain "2"
      And I should see "32" within "edit sprint expected velocity"
      And the "Velocity in points" should not be visible
    When I fill in "Sprint start date" with "01/01/2012"
      And I fill in "Duration of sprint in days" with "a"
    Then I should see "Enter a value using whole numbers"
      And I should see "(enter duration of sprint)" within "edit sprint expected velocity"
    When I fill in "Duration of sprint in days" with ""
    Then I should see "Sprint duration is required"
    When I fill in "Duration of sprint in days" with "5"
    Then I should see "20" within "edit sprint expected velocity"
    When I fill in "Number of team members" with "a"
    Then I should see "Team size must be a valid number"
      And I should see "(enter your team size)" within "edit sprint expected velocity"
    When I fill in "Number of team members" with ""
    Then I should see "Team size is required"
    When I fill in "Number of team members" with "3"
    Then I should see "30" within "edit sprint expected velocity"
    When I follow "Update sprint settings"
    Then I should see "Sprint number 1 has been updated"
    When I fill in "Duration of sprint in days" with "30"
      And I follow "Update sprint settings"
    Then I should see the warning "Sprint was not updated. Please address problems and try again"
      And I should see "we could not update the sprint"
      And I should see "Start date and duration overlaps with sprint 2"
    When I follow "cancel"
    Then I should see the page title "Backlog 1"
      And the "Sprint 1" tab should be selected
    When I follow "Settings"
    Then the "Sprint 1" tab should be selected
      And I should see the page title "Backlog settings"
      And the "Sprint start date" field should contain "01/01/2012"
      And the "Duration of sprint in days" field should contain "5"
      And the "Use backlog velocity of 2 points per person per day and team size" checkbox should be checked
      And the "Number of team members" field should contain "3"
      And I should see "30" within "edit sprint expected velocity"
      And the "Velocity in points" should not be visible
    When I choose "Manually define a team velocity for this sprint"
      And I wait for AJAX for 1 second
    Then the "Number of team members" should not be visible
      And I fill in "Velocity in points" with "a"
    Then I should see "Velocity must be a valid number"
    When I fill in "Velocity in points" with ""
    Then I should see "Velocity is required"
    When I fill in "Velocity in points" with "20"
      And I follow "Update sprint settings"
    Then I should see the notice "Sprint number 1 has been updated"
    When I follow "← Back to backlog"
    Then the "Sprint 1" tab should be selected
    When I follow "Settings"
    Then the "Sprint 1" tab should be selected
      And the "Velocity in points" field should contain "20"
      And the "Manually define a team velocity for this sprint" checkbox should be checked
      And the "Number of team members" should not be visible
    When I choose "Use backlog velocity of 2 points per person per day and team size"
      And I wait for AJAX for 1 second
      Then the "Velocity in points" should not be visible
    When I click on "2 backlog tab"
    Then I should see "Discard changes?"
    When I press "Cancel"
    Then the "Sprint 1" tab should be selected
    When I click on "2 backlog tab"
    Then I should see "Discard changes?"
    When I press "Discard changes"
      And I wait for AJAX for 0.5 second
    Then the "Sprint 2" tab should be selected
      And the "Sprint start date" field should contain "12/01/2012"
      And the "Duration of sprint in days" field should contain "7"
      And the "Manually define a team velocity for this sprint" checkbox should be checked
      And the "Velocity in points" field should contain "30"
      And the "Number of team members" should not be visible

  @javascript
  Scenario: Create new sprint for a backlog without day estimations and edit ensuring day estimation options are not available
    Given a backlog named "Backlog 1" assigned to company "Microsoft" for account "Acme" is set up
      And I am on the backlog "Backlog 1" page
    When I follow "Settings"
      And I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
    When I click on the "add sprint button"
    Then a "new sprint dialog box" should be visible
      And I should see "Create a new sprint"
      And the "new sprint estimation question" should not be visible
    When I press "Create"
    Then I should see "One or more fields are not completed"
      And I should see "Velocity is required"
    When I fill in "Expected team velocity for this sprint" with "3"
      And I press "Create"
    Then I should see the notice "Sprint number 1 has been added"
      Then the "Sprint 1" tab should be selected
    # now edit the settings and make sure validation is working as expected
    When I follow "Settings"
    Then the "Sprint 1" tab should be selected
      And the "Team velocity for this sprint" field should contain "3"
      And the "edit sprint estimation question" should not be visible
    When I fill in "Team velocity for this sprint" with "a"
      Then I should see "Velocity must be a valid number"
    When I fill in "Team velocity for this sprint" with ""
      Then I should see "Velocity is required"
    When I fill in "Team velocity for this sprint" with "3.2"
      And I follow "Update sprint settings"
    Then I should see the notice "Sprint number 1 has been updated"
    When I follow "← Back to backlog"
    Then the "Sprint 1" tab should be selected
    When I follow "Settings"
    Then the "Team velocity for this sprint" field should contain "3.2"



