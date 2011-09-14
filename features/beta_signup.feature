Feature: Beta Signup Page
  In order to apply for early access to easyBacklog
  A visitor
  Should be able to enter their details and receive confirmation that an email was sent

  @javascript
  Scenario: Story carousel is working
    Given I am on the home page
      And I click on the "visible story card"
    Then the second beta feature should be selected
    And I wait 1 second
    When I click on the "6th beta feature"
    And I wait 1 second
    Then I should see "reliably use easyBacklog" within the "visible story card"
    When I click on the "6th beta feature"
    And I wait 1 second
    Then I should see "reliably use easyBacklog" within the "visible story card"
      And the 6th beta feature should be selected

  @javascript
  Scenario: Apply for beta access
    Given I am on the home page
      And no emails have been sent
      And I click on the "submit button"
    Then I should see "Oops, that's not a valid email." within the "beta page error message"
    When I fill in "beta_signup_email" with "john@acme.com"
      And I fill in "beta_signup_company" with "Acme"
      And I click on the "submit button"
      And I wait for 2 seconds
    Then I should see "Thanks for applying for early access!" within "beta page request access area"
      And "john@acme.com" should receive an email
      When I open the email
      Then I should see "j.mp/" in the email body