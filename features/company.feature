Feature: Company
  In order to group my backlogs
  A visitor
  Should be able to assign backlogs optionally to a company

  # Creation of companies is tested in backlog.features as integral to backlog functionality

  Scenario: Manage Company
    Given a user named "John" is registered
      And I am signed in as "John"
      And the standard locales are set up
      And an account called "Acme" is set up for "John"
      And a backlog named "Backlog 1" assigned to company "Microsoft" for account "Acme" is set up
      And I am on the accounts page
    When I follow "Microsoft"
    Then I should see the page title "Edit Company Defaults"
      And the "Company Name" field should contain "Microsoft"
      And the "Default day rate" field should contain "800"
      And the "Default velocity" field should contain "3"
      And the "By default, use the 50/90 estimation method" checkbox should be checked
    When I fill in "Company Name" with ""
      And I fill in "Default day rate" with "A"
      And I fill in "Default velocity" with "B"
      And I press "Update company"
    Then I should see the following error messages:
      | Name can't be blank |
      | Default rate is not a number |
      | Default velocity is not a number |
    When I fill in "Company Name" with "New Co"
      And I fill in "Default day rate" with "10"
      And I fill in "Default velocity" with "5"
      And I uncheck "By default, use the 50/90 estimation method"
      And I press "Update company"
    Then I should see the page title "Acme"
    When I follow "New Co"
      And the "Default day rate" field should contain "10"
      And the "Default velocity" field should contain "5"
      And the "By default, use the 50/90 estimation method" checkbox should not be checked
