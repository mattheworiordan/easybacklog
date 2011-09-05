Feature: Backlog Stories
  In order to manage the stories of a backlog
  A visitor
  Should be able to add, remove and rearrange stories

  Background:
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      # Backlog has rate of £800 and velocity of 3 by default
      # create three themes, Theme 1, Theme 2, Theme 3 (with codes TH1, TH2, TH3)
      And a backlog named "Backlog 1" with 3 themes is set up for "Acme"
      And I am on the backlog "Backlog 1" page

  @javascript
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
        | 1         | as        | I want to   | so I can  | comments    | 1         | 3         |
        | 2         | as 2nd    |             |           |             |           |           |

  @javascript
  Scenario: Delete and duplicate a story
    Given the following stories are created in the first theme
      | first   |
      | second  |
      | third   |
    When I click on the "first story's duplicate"
      And I wait for 0.5 seconds
    Then there should be 4 "story" elements

    When I click on the "second story's delete"
      And I press "Cancel" within "the dialog"
      And I wait for 0.5 seconds
    Then there should be 4 "story" elements
    When I click on the "second story's delete"
      And I press "Delete" within "the dialog"
      And I wait for 0.5 seconds
    Then there should be 3 "story" elements

    # now check if you add a new story but never persist it i.e. leave it blank, then it should not prompt for a delete
    When the focus is on the "first theme's add story button"
    And I press enter and wait for AJAX
    Then there should be 4 "story" elements
    When I click on the "fourth story's delete"
      And I wait for 0.5 seconds
    Then there should be 3 "story" elements

  @javascript
  Scenario: Ensure validations are working
    Given the following stories are created in the first theme
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
    Then I should see the error "Score 50 must be in the Fibonacci sequence"
      And I should not see "4" within the "first story's 50 score"
    When I click on the "first story's 90 score"
      And I change the current editable text to "4"
      And I tab forwards and wait for AJAX
    Then I should see the error "Score 90 must be in the Fibonacci sequence"
      And I should not see "4" within the "first story's 90 score"
    When I click on the "first story's 90 score"
      And I change the current editable text to "3"
      And I tab forwards and wait for AJAX
    Then I should see "3" within the "first story's 90 score"
    When I click on the "first story's 50 score"
      And I change the current editable text to "5"
      And I tab forwards and wait for AJAX
    Then I should see the error "Score 90 must be less than or equal to score 50"

  @selenium
  Scenario: Re-order stories and move stories to new themes
    # to identify stories we set the "as" field and use that find stories when dragging
    Given the following stories are created in the first theme
      | first   |
      | second  |
      | third   |
    And the following stories are created in the second theme
      | fourth  |
      | fifth   |
    When I drag story with as equal to "first" down by 1 position
    Then story with as equal to "first" should be in position 2
    When I drag story with as equal to "third" up by 2 positions
    Then story with as equal to "third" should be in position 1
      And the story with as equal to "second" should be in position 2
      And the story with as equal to "first" should be in position 3
    When I click on the "second story's drag handle" within the "second theme"
    Then I should see "Move story" within "the dialog"
      And "Theme 2" should be selected for "theme-target"
    When I select "Theme 1" from "theme-target"
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
  Scenario: Check that as a drop down works
    Given the following stories are created in the first theme
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