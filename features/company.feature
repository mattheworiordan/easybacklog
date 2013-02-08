Feature: Company
  In order to group my backlogs
  A visitor
  Should be able to assign backlogs optionally to a company

  # Creation of companies is tested in backlog.features as integral to backlog functionality
  Background:
    Given a user named "John" is registered
      And the database has the necessary lookup tables
      And I am signed in as "John"
      And an account called "Acme" is set up for "John" who should have account admin rights
      And a backlog named "Backlog 1" assigned to company "Apple Inc" for account "Acme" is set up
      And I am on the accounts page

  Scenario: Manage Company
    When I follow "Apple Inc"
    Then I should see the page title "Company settings"
      And the "Company Name" field should contain "Apple Inc"
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
    When I follow "Apple Inc"
    Then I should see the page title "Company settings"

    # check company name validation is working
    When I fill in "Company Name" with "Google"
      And the focus is blurred
    Then I should see "A company with this name is already set up"
    When I fill in "Company Name" with "Oracle"
      And the focus is blurred
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

  @javascript
  Scenario: Allow company locale to be set as default (inherit) or set explicitly
    When I am on the accounts page
    When I follow "Apple Inc"
    Then I should see the page title "Company settings"
      # locale for new accounts defaults to British English in Cucumber environment
      And "Use default British English..." should be selected for "What is your preferred language setting?"
    When I select "American English" from "What is your preferred language setting?"
      And I press "Update company"
    Then I should see the notice "Company defaults were successfully updated"
    When I follow "Apple Inc"
    Then I should see the page title "Company settings"
      And "American English" should be selected for "What is your preferred language setting?"
    When I follow "cancel"
      And I follow "Backlog 1"
      And I follow "Settings"
    Then "Use default American English..." should be selected for "What is your preferred language setting?"
    When I am on the accounts page
      And I follow "Apple Inc"
      And I select "Use default British English..." from "What is your preferred language setting?"
      And I press "Update company"
      And I follow "Backlog 1"
      And I follow "Settings"
    Then "Use default British English..." should be selected for "What is your preferred language setting?"

  @javascript
  Scenario: No access user is given read privileges for the company so should see the company backlogs but not change the company settings
    Given a user named "Mike no access" is created with no rights and assigned to account "Acme"
      And a user named "Z at bottom" is created with no rights and assigned to account "Acme"
    When I follow "Apple Inc"
      And I follow "Manage company users"
    Then I should see "Users for Apple Inc"
      And I should see the following data in column 1 of "account user table" table:
        | John            |
        | Mike no access  |
        | Z at bottom     |
      And I should see the following data in column 3 of "account user table" table:
        | Administrator access to all features |
        |                                      |
        |                                      |
      And "No access (inherited)" should be selected for "Mike no access"
      And "No access (inherited)" should be selected for "Z at bottom"
    When I select "Read only access to this company" from "Mike no access"
      And I wait 1 second
      And I sign out
      And I am signed in as "Mike no access"
    # Mike no access should see the company and its backlogs, but not be able to edit them
    Then I should see "Apple Inc" within "your side panel"
      And I should see "Backlog 1"
      And within the "dashboard company or account fields" there should not be a clickable element with the text "Apple Inc"
      And within "your side panel" there should not be a clickable element with the text "Apple Inc"
      And I should not see "Create a new backlog"
    When I sign out
      And I am signed in as "Z at bottom"
    Then I should not see "Apple Inc"
      And I should not see "Backlog 1"

  @javascript
  Scenario: No access user is given full privileges for the company so should see the company backlogs and be allowed to edit the company settings
    Given a user named "Mike no access" is created with no rights and assigned to account "Acme"
    When I follow "Apple Inc"
      And I follow "Manage company users"
    Then I should see "Users for Apple Inc"
      And "No access (inherited)" should be selected for "Mike no access"
    When I select "Full access to this company" from "Mike no access"
      And I wait 1 second
      And I sign out
      And I am signed in as "Mike no access"
    # Mike no access should see the company and its backlogs, but not be able to edit them
    Then I should see "Apple Inc" within "your side panel"
      And I should see "Backlog 1"
      And within the "dashboard company or account fields" there should be a clickable element with the text "Apple Inc"
      And within "your side panel" there should be a clickable element with the text "Apple Inc"
      And I should not see "Create a new backlog"
    When I follow "Apple Inc"
      Then I should see "Company settings"
      And I should not see "Manage company users"