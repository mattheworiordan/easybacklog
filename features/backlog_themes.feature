Feature: Backlog Themes
  In order to manage the themes of a backlog
  A visitor
  Should be able to add, remove and rearrange themes

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"
      And a standard backlog named "My First Backlog" is set up for "Acme"
      And I am on the backlog "My First Backlog" page

  @javascript
  Scenario: Add a new theme and check codes
    When I follow "Add theme"
      And I wait for 0.25 seconds
    When I change the current editable text to "First"
      And I tab forwards and wait for AJAX to update
    # check that generated Theme code is right
    Then I should see "FIR" within the "first theme's code"
    When I change the editable text "First" within "theme name" to "First modified"
      And I tab forwards and wait for AJAX to update
    # check that code is not updated
    Then I should see "FIR" within the "first theme's code"

    Given I create a theme named "Second"
    # check that generated Theme code is right in 2nd theme
    Then I should see "SEC" within the "second theme's code"

    Given I create a theme named "SecondActuallyThird"
    # check that code is variation on SEC in 3rd theme
    Then I should see "SE1" within the "third theme's code"

    # we now have 3 themes
    Then there should be 3 "theme" elements

    # delete the middle theme
    When I delete the second theme
      # and then the dialog
      And I press "Delete" within "a dialog"
      And I wait 0.50 seconds
    Then there should be 2 "theme" elements

    # modify theme SecondActuallyThird's code
    When I change the editable text "SE1" within "theme code" to "ttt"
      And I tab forwards and wait for AJAX to update
    # theme code should become capitalised
    Then the server should return theme JSON as follows:
      | name                | code  |
      | First modified      | FIR   |
      | SecondActuallyThird | TTT   |

  @javascript
  Scenario: Ensure validations are working and errors are displayed
    Given the following themes are created:
      | Theme 1 |
      | Theme 2 |
      | Theme 3 |
    Then there should be 3 elements matching "li.theme"

    # check that errors are displayed, and theme name reverts
    When I click on "second theme's name"
      And I change the current editable text to "Theme 1"
      And I tab forwards and wait for AJAX to update
    Then I should see the error "Name has already been taken"
      And I should see the text "Theme 2" within the "second theme's name"

    When I click on "second theme's code"
      # Theme 1's code is auto-generated to TH1 so this will conflict
      And I change the current editable text to "TH1"
      And I tab forwards and wait for AJAX to update
    Then I should see the error "Code has already been taken"
      And I should see the text "TH2" within the "second theme's code"

  @selenium
  Scenario: Ensure the tab order works
    # new theme starts with Add theme selected
    Then the focussed element should have the text "Add theme"
      And within the "backlog data area" there should be a clickable element with the text "Add theme"
      And within the "backlog data area" there should be a clickable element with the text "Reorder themes"
    When I follow "Add theme"
      And I wait 0.25 seconds
    # after clicking new theme, focus shifts to new theme name
    Then the focussed element should be a "theme name"
      And the focussed element should be an editable text field
    When I tab forwards
    Then the focussed element should have the text "Add theme"
    When I tab forwards
    Then the focussed element should have the text "Reorder themes"
    # tab back to the editable text field
    When I tab backwards
      And I tab backwards
    Then the focussed element should be an editable text field
    # tab back again from the top most theme field
    When I tab backwards
      And I wait for 1 second
    # can't go back any further, so should still be a theme field
    Then the focussed element should be the "first theme's name"

    # Create theme 1
    When I change the current editable text to "Theme 1"
      And I tab forwards and wait for AJAX to update
    Then the focussed element should have the text "Add story"

    # Create theme 2
    When I tab forwards
      And press enter and wait for AJAX to update
    Then the focussed element should be a "theme name"
    When I change the current editable text to "Theme 2"
      And I press enter and wait for AJAX to update
    Then the focussed element should have the text "Add story"

    # Create theme 3
    When I tab forwards
      And press enter and wait for AJAX to update
      And I change the current editable text to "Theme 3"
      And I press enter and wait for AJAX to update
    Then the focussed element should have the text "Add story"

    When I tab backwards 5 times
    # we should be on the first theme text area
    Then the focussed element should be the "name field of the first theme"

  @selenium
  Scenario: Reorder themes
    When I follow "Reorder themes"
      Then I should see the warning "You need more than one theme to reorder"
    Given the following themes are created:
      | Theme 1 |
    Given the following themes are created:
      | Theme 2 |
      | Theme 3 |
      | Theme 4 |
    # drag handles are not visible unless you are re-ordering themes
    Then the "move theme handle" should not be visible
    When I follow "Reorder themes"
    # drag handles are now visible
    Then the "move theme handle" should be visible
    When I follow "Stop ordering"
    Then the "move theme handle" should not be visible
    When I reorder the first theme
    Then the "move theme handle" should be visible
    When I drag theme "Theme 2" down by 2 positions
    Then theme "Theme 2" should be in position 4
    When I drag theme "Theme 3" up by 1 position
    Then theme "Theme 3" should be in position 1
    When I follow "Stop ordering"
      And I wait for AJAX for 2 seconds
    Then the server should return theme JSON as follows:
      | name    | code  |
      | Theme 3 | TH3   |
      | Theme 1 | TH1   |
      | Theme 4 | TH4   |
      | Theme 2 | TH2   |

  @javascript
  Scenario: Renumber stories
    Given the following themes are created:
        | Theme 1 |
      And the following stories are created in the first theme:
        | first   |
        | second  |
        | third   |
    When I change the editable text "TH11" within the "first story's unique ID" to "5"
      And I change the editable text "TH12" within the "second story's unique ID" to "10"
      And I change the editable text "TH13" within the "third story's unique ID" to "15"
      And I tab forwards and wait for AJAX
    Then the server should return story JSON as follows:
      | as_a    | unique_id |
      | first   | 5         |
      | second  | 10        |
      | third   | 15        |
    When I re-number the first theme
      And I press "Re-number" within "the dialog"
      And I wait for 2 seconds
    Then I should see "TH11" within the "first story's unique ID"
      And the server should return story JSON as follows:
        | as_a    | unique_id |
        | first   | 1         |
        | second  | 2         |
        | third   | 3         |

  @javascript
  Scenario: Show a user a warning when trying to assign stories to a sprint when no sprints exist
    When I assign stories to a sprint for the first theme
    Then I should see the warning "You have not created any sprints yet"
    When I click on the "add sprint button"
      And I press "Create"
      And I follow "Mark sprint as complete"
      And I click on "Backlog backlog tab"
      And I assign stories to a sprint for the first theme
    Then I should see the warning "All sprints are marked as complete"

  @javascript
  Scenario: Allow user to assign all stories within a theme to a sprint
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    # set up another incomplete sprint
    When I click on the "add sprint button"
      And I press "Create"
      And I click on "Backlog backlog tab"
    When I assign stories to a sprint for the first theme
    Then I should see the warning "All stories are already assigned to a sprint"
    When I assign stories to a sprint for the second theme
    Then a "assign story dialog box" should be visible
      And "Select a sprint" should be selected for "Assign stories"
    When I select "Sprint 4" from "Assign stories"
      And I press "Assign"
      And I wait for 1 second
    Then I should see the notice "3 stories have been assigned to sprint 4"
      And the first story within the second theme should be assigned to sprint 4
      And the third story within the second theme should be assigned to sprint 4
    # now unassign just one story so that we can reassign and ensure only one story is assigned
    When I assign to a sprint the first story within the first theme
    Then "Sprint 3" should be selected for "Assign story"
    When I select "None - remove from sprint 3" from "Assign story"
      And I press "Assign"
      And I wait for 0.5 seconds
    Then the first story within the first theme should not be assigned to a sprint
    When I assign stories to a sprint for the first theme
    Then a "assign story dialog box" should be visible
    When I select "Sprint 3" from "Assign stories"
      And I press "Assign"
      And I wait for 1 second
    Then I should see the notice "1 story has been assigned to sprint 3"
      And the first story within the first theme should be assigned to sprint 3
      And the second story within the first theme should be assigned to sprint 1
      And the third story within the first theme should be assigned to sprint 2

  @javascript
  Scenario: Show a user a warning when trying to move a theme to another sprint and no other backlog exists
    When I move to a backlog for the first theme
      And I wait 0.5 seconds
    Then I should see the warning "There are no editable backlogs that you can move this theme to"

  @javascript
  Scenario: Show a user a warning when trying to move a theme that has sprint assigned stories within it
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    When I move to a backlog for the first theme
    Then I should see the warning "You cannot move stories that are assigned to sprints"

  @javascript
  Scenario: Allow a user to move a theme into another backlog
    Given an example backlog for testing is set up for the account "Acme"
      And I am on the backlog "Cucumber example backlog" page
    When I click on "second theme's name"
      And I change the current editable text to "Theme to be moved"
      And I tab forwards and wait for AJAX to update
    Then I should see the text "Theme to be moved" within the "second theme's name"
      And I should see "17.0 points" within the "backlog totals"
    When I move to a backlog for the second theme
    Then a "move theme dialog box" should be visible
    When I wait for 0.5 seconds
    Then "Select a backlog" should be selected for "Select the target backlog"
    When I select "My First Backlog" from "Select the target backlog"
      And I press "Yes, move this theme"
    Then I should see the notice "Theme has been moved to "
      And I should see the notice "My First Backlog"
      And I should see "11.0 points" within the "backlog totals"
    When I am on the backlog "My First Backlog" page
      Then I should see the text "Theme to be moved" within the "third theme's name"