Feature: Account Users
  In order to manage who has access to my backlogs
  A member
  Should be able to change admin rights and revoke all rights from account users

  @javascript
  Scenario: Revoke and assign rights
    Given a user named "Admin" is registered
      And the database has the necessary lookup tables
      And an account called "Acme" is set up for "Admin" who should have account admin rights
      And a backlog named "Website backlog" assigned to company "Microsoft" for account "Acme" is set up
      And a user named "ChangedToAdmin" is created and assigned to account "Acme"
      And a user named "Full" is created and assigned to account "Acme"
      And a user named "ReadOnly" is created and assigned to account "Acme"
      And a user named "NoAccess" is created and assigned to account "Acme"
      And a user named "ToBeDeleted" is created and assigned to account "Acme"
      And I am signed in as "Admin"
      And I am on the accounts page
    When I follow "Account"
      And I follow "Manage Users"
    Then I should see the following data in column 1 of "account user table" table:
      | Admin           |
      | ChangedToAdmin  |
      | Full            |
      | NoAccess        |
      | ReadOnly        |
      | ToBeDeleted     |
      # Admin account owner does not have a toggle box
      And there should be 5 "unchecked toggle boxes"
    # make ChangedToAdmin an admin
    When I click the "first toggle box"
      And I wait 1 second
      And I select "Full access to all" from "Full"
      And I select "Read only access to all" from "ReadOnly"
      And I select "No access" from "NoAccess"
      And I wait 2 seconds
      And I follow "Account"
      And I follow "Manage Users"
    # reload the page to ensure AJAX updates worked
    Then the first toggle box should be checked
      And "Full access to all" should be selected for "Full"
      And "Read only access to all" should be selected for "ReadOnly"
      And "No access" should be selected for "NoAccess"
      And I should see the following data in column 3 of "account user table" table:
        | Administrator access to all features |
        | Administrator access to all features |
        |                                      |
        |                                      |
        |                                      |
        |                                      |

    When I follow "Account"
      And I follow "Sign out"
      And I am signed in as "ChangedToAdmin"
      And I follow "Account"
    Then I should see "Manage Users" within "top nav"
      And I should see "Manage Account" within "top nav"
      And I follow "Manage Users"
    # if you can see users, you are an admin
    Then I should see the following data in column 1 of "account user table" table:
      | Admin           |
      | ChangedToAdmin  |
      | Full            |
      | NoAccess        |
      | ReadOnly        |
      | ToBeDeleted     |

    When I click on the "delete user icon for tobedeleted@acme.com"
      And I press "Delete" within "a dialog"
      And I wait 0.5 seconds
    Then I should see the following data in column 1 of "account user table" table:
      | Admin           |
      | ChangedToAdmin  |
      | Full            |
      | NoAccess        |
      | ReadOnly        |

    When I follow "Sign out"
      And I am signed in as "Full"
      And I follow "Account"
    Then I should not see "Manage Users" within "top nav"
      And I should see "Manage Account" within "top nav"
      And I should see "Acme" within "primary page heading"

    When I follow "Sign out"
      And I am signed in as "ReadOnly"
    Then I should not see "Account" within "top nav"
      And I should see "Website backlog"

    When I follow "Sign out"
      And I am signed in as "NoAccess"
    Then I should not see "Account" within "top nav"
      And I should not see "Website backlog"

    When I follow "Sign out"
      And I am signed in as "ToBeDeleted"
      And I should not see "Acme" within "primary page heading"
      And I should see "You do not have an account" within "primary page heading"

  Scenario: User who has rights to more than one account should be shown the Dashboard after logging in
    Given a user named "John" is registered
      And the database has the necessary lookup tables
      And an account called "Acme" is set up for "John"
      And an account called "Big Co" is set up for "John"
      And I am signed in as "John"
    Then I should see "Latest activity across all backlogs"
      And I should see "easyBacklog" within "primary page heading"
      And I should see "Acme" within "top nav"
      And I should see "Big Co" within "top nav"
    When I follow "Big Co"
    Then I should see "Big Co" within "primary page heading"
      And I should see "Switch accounts" within "top nav"