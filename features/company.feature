Feature: Company
  In order to group my backlogs
  A visitor
  Should be able to assign backlogs optionally to a company

  # Creation of companies is tested in backlog.features as integral to backlog functionality
  Background:
    Given a user named "John" is registered
      And I am signed in as "John"
      And the database has the necessary lookup tables
      And an account called "Acme" is set up for "John"
      And a backlog named "Backlog 1" assigned to company "Microsoft" for account "Acme" is set up
      And I am on the accounts page

  Scenario: Manage Company
    When I follow "Microsoft"
    Then I should see the page title "Edit Company Defaults"
      And the "Company Name" field should contain "Microsoft"
      And the "Rate (optional)" field should contain "800"
      And the "Velocity" field should contain "3"
      And the "By default, use the 50/90 estimation method" checkbox should be checked
    When I fill in "Company Name" with ""
      And I fill in "Rate (optional)" with "A"
      And I fill in "Velocity" with "B"
      And I press "Update company"
    Then I should see the following error messages:
      | Name can't be blank |
      | Default rate is not a number |
      | Default velocity is not a number |
    When I fill in "Company Name" with "New Co"
      And I fill in "Rate (optional)" with "10"
      And I fill in "Velocity" with "5"
      And I uncheck "By default, use the 50/90 estimation method"
      And I press "Update company"
    Then I should see the page title "Acme"
    When I follow "New Co"
      And the "Rate (optional)" field should contain "10"
      And the "Velocity" field should contain "5"
      And the "By default, use the 50/90 estimation method" checkbox should not be checked

  @javascript
  Scenario: Toggle use of rate and velocity and test front end validation
    Given a backlog named "Backlog 2" assigned to company "Google" for account "Acme" is set up
    When I am on the accounts page
    When I follow "Microsoft"
    Then I should see the page title "Edit Company Defaults"

    # check company name validation is working
    When I fill in "Company Name" with "Google"
    And I wait for AJAX for 1 second
    Then I should see "A company with this name is already set up"
    When I fill in "Company Name" with "Oracle"
    And I wait for AJAX for 1 second
    Then I should not see "A company with this name is already set up"

    # now check behaviour of scoring options
    When I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
    Then the "company velocity" should not be visible
      And the "company rate" should not be visible
    When I press "Update company"
    Then I should see the notice "Company defaults were successfully updated"
    When I follow "Oracle"
    # ensure settings are retained after save and correct fields are hidden
    Then I should see "By default, would you like to have"
      And the "No, I'd prefer to estimate once I set up my first iteration and defined the velocity" checkbox should be checked
      And the "company velocity" should not be visible
      And the "company rate" should not be visible
    When I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
    Then the "company velocity" should be visible
      And the "company rate" should be visible
      And the "Velocity" field should be empty
      And the "Rate (optional)" field should be empty
    When I fill in "Velocity" with "2.0"
      And I fill in "Rate (optional)" with "55"
      # now check settings are retained when toggling calculation preference
      And I choose "No, I'd prefer to estimate once I set up my first iteration and defined the velocity"
      And I choose "Yes, I would like to automatically estimate the days required to deliver my backlog"
    Then the "Velocity" field should contain "2.0"
      And the "Rate (optional)" field should contain "55"
    When I press "Update company"
    Then I should see the notice "Company defaults were successfully updated"
    When I follow "Oracle"
    # ensure settings are retained after save and correct fields are hidden
    Then the "Yes, I would like to automatically estimate the days required to deliver my backlog" checkbox should be checked
      And the "company velocity" should be visible
      And the "company rate" should be visible
      And the "Velocity" field should contain "2.0"
      And the "Rate (optional)" field should contain "55"