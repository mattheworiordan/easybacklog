Feature: Backlog Stories
  In order to manage the stories of a backlog
  A visitor
  Should be able to add, remove and rearrange stories

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"
      # Backlog has rate of £800 and velocity of 3 by default
      # create three themes, Theme 1, Theme 2, Theme 3 (with codes TH1, TH2, TH3)
      And a backlog named "Backlog 1" with 3 themes is set up for "Acme"
      And I am on the backlog "Backlog 1" page

  @selenium
  Scenario: Set up a basic story ensuring tab order works
    Given the focus is on the "first theme's name"
    When I tab forwards
    Then the focussed element should have the text "Add story"
    When I press enter and wait for AJAX
    Then the focussed element should be an editable text field
    # at this point the story is not actually created, the view is empty
      And I should see "TH1" within the "first story's code"
      And I should not see "TH11" within the "first story's code"
      And I should not see "£0" within the "first story's cost"
      And I should not see "0" within the "first story's days"
    # set as
    When I change the current editable text to "as"
      And I tab forwards and wait for AJAX
    # the story should have been persisted to the database now
    Then I should see "TH11" within the "first story's code"
      And I should see "£0" within the "first story's cost"
      And I should see "0" within the "first story's days"
    # set I want to
    When I change the current editable text to "I want to"
      And I tab forwards
      # set so I can
      And I change the current editable text to "so I can"
      # skip straight to comments
      And I tab forwards 2 times
      And I change the current editable text to "comments"
      # 50 and then 90 field
      And I tab forwards
      And I change the current editable text to "1"
      And I tab forwards
      And I change the current editable text to "3"
      And I tab forwards
    Then I should see "£644" within the "first story's cost"
      And I should see "0.8" within the "first story's days"
      And I should see "as" within the "first story's as field"
      And I should see "I want to" within the "first story's I want to field"
      And I should see "so I can" within the "first story's so I can field"
      And I should see "comments" within the "first story's comments"
      And I should see "1" within the "first story's 50 score"
      And I should see "3" within the "first story's 90 score"
    Then the focussed element should have the text "Add story"
    When I press enter and wait for AJAX
      And I change the current editable text to "as 2nd"
      And I tab forwards and wait for AJAX
      And I tab backwards 2 times
    Then the focussed element should be a "story code"
      # when editing a code, the Theme code should disappear to reveal the story ID
      And the editable text value should be "2"
    # move back an entire story which contains 8 elements when using 50/90 rule
    When I tab backwards 8 times
    Then the focussed element should be a "story code"
    When I tab forwards 16 times
    Then the focussed element should have the text "Add story"
      And the server should return story JSON as follows:
        | unique_id | as_a      | i_want_to   | so_i_can  | comments    | score_50  | score_90  |
        | 1         | as        | I want to   | so I can  | comments    | 1.0       | 3.0       |
        | 2         | as 2nd    |             |           |             |           |           |

  @javascript
  Scenario: Delete and duplicate a story
    Given the following stories are created in the first theme:
      | first   |
      | second  |
      | third   |
    When I duplicate the first story
      And I wait for 0.5 seconds
    Then there should be 4 "story" elements

    When I delete the second story
      And I press "Cancel" within "the dialog"
      And I wait for 0.5 seconds
    Then there should be 4 "story" elements
    When I delete the second story
      And I press "Delete" within "the dialog"
      And I wait for 0.5 seconds
    Then there should be 3 "story" elements

    # now check if you add a new story but never persist it i.e. leave it blank, then it should not prompt for a delete
    When the focus is on the "first theme's add story button"
    And I press enter and wait for AJAX
    Then there should be 4 "story" elements
    When I delete the fourth story
      And I wait for 0.5 seconds
    Then there should be 3 "story" elements

  @javascript
  Scenario: Ensure validations are working
    Given the following stories are created in the first theme:
      | first   |
      | second  |

    # code field should not allow duplicates and should revert on error
    When I click on the "first story's code"
      And I change the current editable text to "2"
      And I tab forwards and wait for AJAX
    Then I should see the error "Unique ID has already been taken"
      And I should see "TH11" within the "first story's code"

    # score fields require Fibonacci sequence and 50 < 90
    When I click on the "first story's 50 score"
      And I change the current editable text to "4"
      And I tab forwards and wait for AJAX
    Then I should see the error "Score 50 is not valid according to the modified Fibonacci sequence"
      And I should not see "4" within the "first story's 50 score"
    When I click on the "first story's 90 score"
      And I change the current editable text to "4"
      And I tab forwards and wait for AJAX
    Then I should see the error "Score 90 is not valid according to the modified Fibonacci sequence"
      And I should not see "4" within the "first story's 90 score"
    When I click on the "first story's 90 score"
      And I change the current editable text to "3"
      And I tab forwards and wait for AJAX
    Then I should see "3" within the "first story's 90 score"
    When I click on the "first story's 50 score"
      And I change the current editable text to "5"
      And I tab forwards and wait for AJAX
    Then I should see the error "Score 50 must be less than or equal to score 90"
    When I click on the "second story's 50 score"
      And I change the current editable text to "5"
      And I tab forwards and wait for AJAX
    Then I should see "5" within the "second story's 50 score"
    When I click on the "second story's 90 score"
      And I change the current editable text to "3"
      And I tab forwards and wait for AJAX
      Then I should see the error "Score 90 must be greater than or equal to score 50"


  @selenium
  Scenario: Re-order stories and move stories to new themes
    # to identify stories we set the "as" field and use that find stories when dragging
    Given the following stories are created in the first theme:
      | first   |
      | second  |
      | third   |
    And the following stories are created in the second theme:
      | fourth  |
      | fifth   |
    When I drag story with as equal to "first" down by 1 position
    Then story with as equal to "first" should be in position 2
    When I drag story with as equal to "third" up by 2 positions
    Then story with as equal to "third" should be in position 1
      And the story with as equal to "second" should be in position 2
      And the story with as equal to "first" should be in position 3
    When I move the second story within the second theme
    Then I should see "Move story" within "the dialog"
      And "Theme 2" should be selected for the "move story dialog theme drop down"
    When I select "Theme 1" from "#theme-target"
      And I press "Move" within "the dialog"
    Then story with as equal to "fifth" should be in position 4
      And story with as equal to "fifth" should be in theme "Theme 1"
      And the server should return story JSON as follows:
        | as_a    |
        | third   |
        | second  |
        | first   |
        | fifth   |
        | fourth  |

  @selenium
  Scenario: Re-order stories by dragging cross themes
    # to identify stories we set the "as" field and use that find stories when dragging
    Given the following stories are created in the first theme:
      | first   |
      | second  |
      | third   |
    And the following stories are created in the second theme:
      | fourth  |
      | fifth   |
    When I drag story with as equal to "first" to the second theme position 1
    Then story with as equal to "first" should be in position 3
    When I drag story with as equal to "fourth" to the first theme position 1
    Then story with as equal to "fourth" should be in position 1
      And the server should return story JSON as follows:
        | as_a    |
        | fourth  |
        | second  |
        | third   |
        | first   |
        | fifth   |

  @javascript
  Scenario: Colour coding of stories should be working
    Given I create a story with as set to "first" in the first theme
    When I click on the "first story's colour picker"
      Then the "colour picker" should be visible
    When I click on the "red colour picker box"
      Then the story with as equal to "first" should be red
    When I click on the "first story's colour picker"
      Then the "colour picker" should be visible
    When I click on the "green colour picker box"
      Then the story with as equal to "first" should be green
    And the server should return story JSON as follows:
      | as_a    | color   |
      | first   | 00ff00  |

  @javascript
  Scenario: Check that as auto-complete drop down works
    Given the following stories are created in the first theme:
      | first   |
      | second  |
      | third   |
    When I click on the "first story's as field"
      And I change the current editable text to ""
    Then I should see the following auto-complete options:
      | first   |
      | second  |
      | third   |
    When I change the current editable text to "th"
    Then I should see the following auto-complete options:
      | third   |
    When I press the down arrow
      And I press enter
    Then I should see "third" within the "first story's as field"

  @javascript
  Scenario: Check that as auto-complete scoring works
    Given the following stories are created in the first theme:
      | first   |
    When I click on the "first story's 90 score"
      And I change the current editable text to ""
    Then I should see the following auto-complete options:
      | 0   |
      | 0.5 |
      | 1   |
      | 2   |
      | 3   |
      | 5   |
      | 8   |
      | 13  |
      | 20  |
      | 21  |
      | 40  |
      | 60  |
      | 100 |
    When I change the current editable text to "3"
    Then I should see the following auto-complete options:
      | 3  |
      | 13 |
    When I press the down arrow
      And I press enter
    Then I should see "3" within the "first story's 90 score"
    When I follow "Settings"
      And I uncheck "Use the 50/90 estimation method"
      And I choose "Anything"
      And I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
    When I click on the "first story's score"
      And I change the current editable text to ""
    Then I should not see an auto-complete option
    When I follow "Settings"
      And I choose "Strict Fibonacci"
      And I press "Update backlog settings"
    Then I should see the notice "Backlog settings were successfully updated"
    When I click on the "first story's score"
      And I change the current editable text to ""
    Then I should see the following auto-complete options:
      | 0   |
      | 0.5 |
      | 1   |
      | 2   |
      | 3   |
      | 5   |
      | 8   |
      | 13  |
      | 21  |
      | 34  |

  @javascript
  Scenario: Theme and story added immediately after each other
    # there was a bug where adding a story straight after a theme would result in the scoring not working, this just checks that
    When I follow "Add theme"
      And I wait for 0.5 seconds
      And I change the current editable text to "Theme 4"
      And I tab forwards and wait for AJAX
    Then the focussed element should have the text "Add story"
      When I press enter and wait for AJAX
      And I change the current editable text to "editor"
      And I click on the "first story's 50 score"
      And I change the current editable text to "3"
      And I tab forwards and wait for AJAX
      And I click on the "first story's 90 score"
      And I change the current editable text to "5"
      And I tab forwards and wait for AJAX
    Then I should see "£1,177" within the "first story's cost"
      And I should see "1.5" within the "first story's days"

  @javascript
  Scenario: Supports multiple scoring rules
    Given I create a story with as set to "first" in the first theme
    When I change the scoring rule for this backlog to "Modified Fibonacci"
    Then the "first story's 50 score" should allow the values "0,0.5,1,2,3,5,40,60,100"
      And the "first story's 90 score" should not allow the values "6,-5,7,101,5.5"
    When I change the scoring rule for this backlog to "Strict Fibonacci"
    Then the "first story's 50 score" should allow the values "0,1,2,3,5,8,13,21,34"
      And the "first story's 90 score" should not allow the values "0.5,20,40,100,-1"
    When I change the scoring rule for this backlog to "Anything"
    Then the "first story's 50 score" should allow the values "0,0.3,5,27.6"
      And the "first story's 90 score" should not allow the values "-1,-0.5"

  @selenium
  Scenario: Check that single score configuration works (not using 50/90 rules, so only one score field)
    When I follow "Settings"
      And I uncheck "Use the 50/90 estimation method"
      And I press "Update backlog settings"
    Then the focus is on the "first theme's name"
    When I tab forwards
    Then the focussed element should have the text "Add story"
    When I press enter and wait for AJAX
    Then the focussed element should be an editable text field
    # at this point the story is not actually created, the view is empty
    # set as
    When I change the current editable text to "as"
      And I tab forwards and wait for AJAX
    # the story should have been persisted to the database now
    Then I should see "0.0" within the "first story's days"
    # skip straight to single score field
    When I tab forwards 4 times
      And I change the current editable text to "3"
      And I tab forwards and wait for AJAX
    Then I should see "1.0" within the "first story's days"
      And the focussed element should have the text "Add story"
    When I press enter and wait for AJAX
      And I change the current editable text to "as 2nd"
      And I tab forwards 5 times
      And I change the current editable text to "21"
      And I tab forwards and wait for AJAX
    Then I should see "7.0" within the "second story's days"
      And the focussed element should have the text "Add story"
    When I tab backwards 8 times
    Then the focussed element should be a "story score"
    When I tab forwards 7 times
    Then the focussed element should be a "story score"
      And the server should return story JSON as follows:
        | unique_id | as_a      | i_want_to   | so_i_can  | comments    | score  |
        | 1         | as        |             |           |             | 3.0    |
        | 2         | as 2nd    |             |           |             | 21.0   |

  @javascript
  Scenario: Check that user is notified when trying to edit an accepted story
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the accounts page
    When I follow "Cucumber example backlog"
    When I click on the "first story's as field"
    Then I should not see the notice "You cannot edit a story that is marked as accepted"
    When I click on the "second story's as field"
    Then I should see the warning "You cannot edit a story that is marked as accepted"

  @javascript
  Scenario: Show a user a warning when trying to assign a story to a sprint when no sprints exist
    Given the following stories are created in the first theme:
      | first   |
    When I assign to a sprint the first story
    Then I should see the warning "You have not created any sprints yet"
    When I click on the "add sprint button"
      And I press "Create"
      And I follow "Mark sprint as complete"
      And I click on "Backlog backlog tab"
      And I assign to a sprint the first story
    Then I should see the warning "All sprints are marked as complete"

  @javascript
  Scenario: Allow user to assign, reassign and remove assignment of a story to a sprint
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    # set up another incomplete sprint
    When I click on the "add sprint button"
      And I press "Create"
      And I click on "Backlog backlog tab"
    When I assign to a sprint the first story within the first theme
    Then a "assign story dialog box" should be visible
      And "Sprint 3" should be selected for "Assign story"
    When I select "Sprint 4" from "Assign story"
      And I press "Assign"
      And I wait for 0.5 seconds
    Then the first story within the first theme should be assigned to sprint 4
    When I assign to a sprint the first story within the first theme
    Then "Sprint 4" should be selected for "Assign story"
    When I select "None - remove from sprint 4" from "Assign story"
      And I press "Assign"
      And I wait for 0.5 seconds
    Then the first story within the first theme should not be assigned to a sprint
