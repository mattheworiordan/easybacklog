Feature: Account
  In order to manage who has access to my backlogs
  A member
  Should be able to change admin rights and revoke all rights from account users

  @javascript
  Scenario: Revoke and assign rights
    Given a user named "John" is registered
      And the standard locales are set up
      And an account called "Acme" is set up for "John" who should have admin rights
      And a user named "Matt" is created and assigned to account "Acme"
      And a user named "Simon" is created and assigned to account "Acme"
      And a user named "Sam" is created and assigned to account "Acme"
      And I am signed in as "John"
      And I am on the accounts page
    When I follow "Users"
    Then I should see the following data in column 1 of "account user table" table:
      | John  |
      | Matt  |
      | Sam   |
      | Simon |
      And there should be 3 "unchecked checkboxes"
    When I check the first checkbox
    And I wait 1 seconds
    And I follow "Users"
    # reload the page to ensure AJAX updates worked
    Then the first checkbox should be checked
    # Matt@acme now has admin rights

    When I follow "Sign out"
      And I am signed in as "Matt"
      And I follow "Users"
    # if you can see users, you are an admin
    Then I should see the following data in column 1 of "account user table" table:
      | John  |
      | Matt  |
      | Sam   |
      | Simon |

    When I click on the "delete user icon for Sam@acme.com"
      And I press "Delete" within "a dialog"
      And I wait 0.5 seconds
    Then I should see the following data in column 1 of "account user table" table:
      | John  |
      | Matt  |
      | Simon |

    # Simon has normal access
    When I follow "Sign out"
      And I am signed in as "Simon"
    Then I should not see "Users" within "top nav"
      And I should see "Acme" within "primary page heading"

    # Sam has no account access
    When I follow "Sign out"
      And I am signed in as "Sam"
    Then I should not see "Users" within "top nav"
      And I should not see "Acme" within "primary page heading"
      And I should see "You do not have an account" within "primary page heading"

  Scenario: User who has rights to more than one account should be shown the Dashboard after logging in
    Given a user named "John" is registered
      And the standard locales are set up
      And an account called "Acme" is set up for "John"
      And an account called "Big Co" is set up for "John"
      And I am signed in as "John"
    Then I should see "Latest activity across all backlogs"
      And I should see "easyBacklog" within "primary page heading"
      And I should see "Acme" within "top nav"
      And I should see "Big Co" within "top nav"
    When I follow "Big Co"
    Then I should see "Big Co" within "primary page heading"
