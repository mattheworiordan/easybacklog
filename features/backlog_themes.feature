Feature: Backlog Themes
  In order to manage the themes of a backlog
  A visitor
  Should be able to add, remove and rearrange themes

  Background:
    Given the standard locales are set up
      And a user named "John" is registered
      And I am signed in as "John"
      And a company called "Acme" is set up for "John"
      And I am on the companies page
      And I follow "Create a new backlog"
      And I fill in "Backlog name" with "My First Backlog"
      And I press "Create new backlog"
    Then I should see the notice "Backlog was successfully created."

  @javascript
  Scenario: Add a new theme and check codes
    When I follow "Add theme"
      And I wait for 0.25 seconds
    When I change the current editable text to "First"
      And I tab forwards and wait for AJAX to update
    # check that generated Theme code is right
    Then I should see "FIR" within "li.theme:first-child .theme-data .code .data"
    When I change the editable text "First" within tag ".theme-data .name" to "First modified"
      And I tab forwards and wait for AJAX to update
    # check that code is not updated
    Then I should see "FIR" within "li.theme:first-child .theme-data .code .data"

    Given I create a theme named "Second"
    # check that generated Theme code is right in 2nd theme
    Then I should see "SEC" within "li.theme:nth-child(2) .theme-data .code .data"

    Given I create a theme named "SecondActuallyThird"
    # check that code is variation on SEC in 3rd theme
    Then I should see "SE1" within "li.theme:nth-child(3) .theme-data .code .data"

    # we now have 3 themes
    Then there should be 3 elements matching "li.theme"

    # delete the middle theme by clicking the icon
    When I click the element "li.theme:nth-child(2) .theme-actions .delete-theme a"
      # and then the dialog
      And I press "Delete" within ".ui-dialog"
      And I wait 0.50 seconds
    Then there should be 2 elements matching "li.theme"

    # modify theme SecondActuallyThird's code
    When I change the editable text "SE1" within tag "li.theme .theme-data .code" to "ttt"
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
    When I click the element "li.theme:nth-child(2) .theme-data .name .data"
      And I change the current editable text to "Theme 1"
      And I tab forwards and wait for AJAX to update
    Then I should see the error "Name has already been taken"
      And I should see the text "Theme 2" within "li.theme:nth-child(2) .theme-data .name .data"

    When I click the element "li.theme:nth-child(2) .theme-data .code .data"
      # Theme 1's code is auto-generated to TH1 so this will conflict
      And I change the current editable text to "TH1"
      And I tab forwards and wait for AJAX to update
    Then I should see the error "Code has already been taken"
      And I should see the text "TH2" within "li.theme:nth-child(2) .theme-data .code .data"

  @javascript
  Scenario: Ensure the tab order works
    # new theme starts with Add theme selected
    Then the focussed element should have the text "Add theme"
      And within "#backlog-container" there should be a clickable element with the text "Add theme"
      And within "#backlog-container" there should be a clickable element with the text "Reorder themes"
    When I follow "Add theme"
      And I wait 0.25 seconds
    # after clicking new theme, focus shifts to new theme name
    Then the focussed element should have a parent "li.theme .theme-data .name .data"
      And the focussed element should be an editable text field
    When I tab forwards
    Then the focussed element should have the text "Add theme"
    When I tab forwards
    Then the focussed element should have the text "Reorder themes"
    # tab back to the editable text field
    When I tab backwards
      And I tab backwards
    Then the focussed element should be an editable text field
    # tab back to the title, wait so that the old field can unblur
    When I tab backwards and wait for AJAX to update
    Then the focussed element should have a parent "#backlog-data-area h2"

    # Create theme 1
    When I tab forwards and wait for AJAX to update
      And I change the current editable text to "Theme 1"
      And I tab forwards and wait for AJAX to update
    Then the focussed element should have the text "Add story"

    # Create theme 2
    When I tab forwards
      And press enter and wait for AJAX to update
    Then the focussed element should have a parent "li.theme .theme-data .name .data"
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
    Then the focussed element should have a parent "ul.themes li.theme:nth-child(1) .theme-data .name"

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
    Then the element ".theme .move-theme" should not be visible
    When I follow "Reorder themes"
    # drag handles are now visible
    Then the element ".theme .move-theme" should be visible
    When I drag theme "Theme 2" down by 2 positions
    Then take a snapshot and show me the page
    Then theme "Theme 2" should be in position 4
    When I drag theme "Theme 3" up by 1 position
    Then take a snapshot and show me the page
    Then theme "Theme 3" should be in position 1
    When I follow "Stop ordering"
      And I wait for AJAX for 2 seconds
    Then the server should return theme JSON as follows:
      | name    | code  |
      | Theme 3 | TH3   |
      | Theme 1 | TH1   |
      | Theme 4 | TH4   |
      | Theme 2 | TH2   |
