Feature: Backlog Acceptance Criteria
  In order to manage the acceptance criteria of a backlog
  A visitor
  Should be able to add, remove and rearrange criteria

Background:
  Given the standard locales are set up
    And a user named "John" is registered
    And I am signed in as "John"
    And an account called "Acme" is set up for "John"
    And a backlog named "Backlog 1" with 1 theme and 2 stories in each theme is set up for "Acme"
    And I am on the backlog "Backlog 1" page

@javascript
Scenario: Add and remove acceptance criteria
  When I click on the "add acceptance criteria button within the first story"
    And I wait for 0.5 seconds
    And I change the current editable text to "line 1"
    And I tab forwards and wait for AJAX
  Then the focussed element should be an "acceptance criterion"
    And I should see "line 1" within the "first acceptance criterion"
  When I change the current editable text to "line 2"
    And I tab forwards
    And I change the current editable text to "line 3"
    And I click on the "second story's so I can field"
    And I tab forwards
    And I change the current editable text to "line 4"
    And I tab forwards and wait for AJAX
    And I tab forwards and wait for AJAX
  Then the focussed element should be the "second story's comments"
  When I click on the "second acceptance criterion"
    And I wait for 0.5 seconds
    And I change the current editable text to ""
    And I tab forwards and wait for AJAX
  Then there should be 3 "acceptance criteria" elements
    And the server should return acceptance criteria JSON as follows:
      | criterion |
      | line 1    |
      | line 3    |
      | line 4    |

@selenium
Scenario: Drag and drop acceptance criteria
  When I click on the "add acceptance criteria button within the first story"
    And I wait for 0.5 seconds
    And I change the current editable text to "line 1"
    And I tab forwards and wait for AJAX
    And I change the current editable text to "line 2"
    And I tab forwards and wait for AJAX
    And I change the current editable text to "line 3"
    And I tab forwards and wait for AJAX
  And I wait for 3 seconds
  When I drag acceptance criterion "line 1" down by 1 position
  Then acceptance criterion "line 1" should be in position 2
    And acceptance criterion "line 2" should be in position 1
  When I drag acceptance criterion "line 3" up by 2 positions
  Then acceptance criterion "line 3" should be in position 1
    And acceptance criterion "line 1" should be in position 3
    And I wait for 10 seconds
    And the server should return acceptance criteria JSON as follows:
      | criterion |
      | line 3    |
      | line 2    |
      | line 1    |

