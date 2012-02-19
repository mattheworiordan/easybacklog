Feature: Backlog Themes
  In order to manage the themes of a backlog
  A visitor
  Should be able to add, remove and rearrange themes

  Background:
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"
      And I am on the accounts page
      And I follow "Create a new backlog"
      And I fill in "Name the backlog" with "My First Backlog"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

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

