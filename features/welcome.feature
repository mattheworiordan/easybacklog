Feature: Welcome landing page
  In order for a visitor to understand what easyBacklog is
  A visitor
  Should be able to visit the home page, interact with the content, and sign up

  @javascript
  Scenario: Story carousel is working
    Given I am on the home page
      And I click on the "visible story card"
    Then the second welcome feature should be selected
    And I wait 1 second
    When I click on the "6th welcome feature"
    And I wait 1 second
    Then I should see "reliably use easyBacklog" within the "visible story card"
    When I click on the "6th welcome feature"
    And I wait 1 second
    Then I should see "reliably use easyBacklog" within the "visible story card"
      And the 6th welcome feature should be selected

  Scenario: Sign up and Log in work correctly
    Given I am on the home page
      And I follow "Sign up"
    Then I should see the page title "Sign up"
    When I follow "easyBacklog"
      And I follow "Log in"
    Then I should see the page title "Log in"