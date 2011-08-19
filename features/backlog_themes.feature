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
  Scenario: Add a new theme
    When I follow "Add theme"
      And I wait for 0.25 seconds
    When I change the current editable text to "First"
      And I wait for AJAX for 0.75 seconds
    # check that generated Theme code is right
    Then I should see "FIR" within "li.theme:first-child .theme-data .code .data"
    When I change the editable text "First" within tag ".data" to "First modified"
      And I wait for AJAX for 0.75 seconds
    # check that code is not updated
    Then I should see "FIR" within "li.theme:first-child .theme-data .code .data"
      And show me the page

    When I click the element ".new-theme:contains('Add theme')"
      And I wait for 0.25 seconds
    When I change the current editable text to "Second"
      And I wait for AJAX for 0.75 seconds
    # check that generated Theme code is right in 2nd theme
    Then I should see "SEC" within "li.theme:nth-child(2) .theme-data .code .data"

    When I click the element ".new-theme:contains('Add theme')"
      And I wait 0.25 seconds
    When I change the current editable text to "SecondActuallyThird"
      And I wait for AJAX for 0.75 seconds
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