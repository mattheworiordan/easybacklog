Feature: Backlog
  In order to show new users how to use easyBacklog
  A visitor
  Should be taken through a walk through when they view the Example backlog

  @javascript
  Scenario: Walk through the backlog
    Given the database has the necessary lookup tables
      And a user named "John" is registered
      And I am signed in as "John"
      And an account called "Acme" is set up for "John"
      And the example backlog is set up for the account "Acme"

    Given I am on the backlog "Example corporate website backlog" page
    Then I should see the text "easyBacklog walk through" within the visible guider
    When I press the close button within the visible guider
    And I wait for 1 second
    Then I should not see a visible guider

    Given I am on the backlog "Example corporate website backlog" page
    When I press the next button within the visible guider
    # theme guider asks user to click on first theme's name
    Then I should see the text "Themes" within the visible guider
    When I click on the "first theme's name"
    # theme guider asks user to click on code field
    Then I should see the text "Fields are editable" within the visible guider
    When I click on the "first theme's code"
    # theme asks to change code and tab forwards
    Then I should see the text "Theme code" within the visible guider
    When I tab forwards and wait for AJAX
    # theme code, shows theme code changed after changing in text field
    Then I should see the text "See how the ID for each story" within the visible guider
    When I press the next button within the visible guider
    # keyboard nav, allow user to tab to the Add story button
    Then I should see the text "Keyboard navigation" within the visible guider
    # this should be 8 tabs, but Selenium is acting weirdly
    When I tab forwards 9 times
      And I wait for 2 seconds
    # show user how to add story
    Then I should see the text "Adding story" within the visible guider
    When I press the next button within the visible guider
    # show story tools next to a story
    Then I should see the text "Story tools" within the visible guider
    When I press the next button within the visible guider
    # asks user to reorder a story (drag & drop), as we're using JS driver and not Selenium it will register the mouse events but not the drag which is fine
    Then I should see the text "Reordering stories" within the visible guider
    When I drag story with as equal to "investor" within the first theme up by 1 position
    # show totals area
    Then I should see the text "Backlog totals" within the visible guider
    When I press the next button within the visible guider
    And I wait 2 seconds
    # show Exporting area
    Then I should see the text "Exporting and Printing" within the visible guider
    When I press the next button within the visible guider
    # get the user to filter the accepted stories using the roll over menu
    Then I should see the text "Filtering Accepted Stories" within the visible guider
    When I hover over the "filter menu"
      And I check "Hide accepted stories"
    # get the user to filter the accepted stories using the roll over menu
    Then I should see the text "Filtered view" within the visible guider
    When I follow "Remove filter"
    # let's move onto the next tab
    Then I should see the text "Backlog tab"
    When I press the next button within the visible guider
