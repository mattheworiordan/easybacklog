Feature: Invite and Sign Up
  In order for users who have accounts to collaborate with other people
  A visitor
  Should be able to invite other users who can in turn sign up

  @javascript
  Scenario: Send invites, delete one, test that invite is revoked and other works through to sign up
    Given a user named "John" is registered
      And the standard locales are set up
      And no emails have been sent
      And I am signed in as "John"
      And an account called "Acme" is set up for "John" who should have admin rights
      And I am on the accounts page
    When I follow "Users"
    Then there should be 1 "account user"
      # check user is admin
      And I should see "Yes" within the "account user table"
      And I should see "John" within the "account user table"
    When I follow "Add users"
      And I fill in "emails" with "asd"
      And I press "Send invites"
    Then I should see the error "The email address 'asd' is not valid. Please correct this to continue."
      And I fill in "emails" with "james@acme.com, michael@acme.com, jim@acme.com, jane@acme.com"
      And I press "Send invites"
    Then I should see the notice "4 people were added to your account."
      And I should see the following data in column 1 of "invite user table rows" table:
        | james@acme.com    |
        | jane@acme.com     |
        | jim@acme.com      |
        | michael@acme.com  |
      And "james@acme.com" should receive an email
      And "michael@acme.com" should receive an email

    # now revoke Michael's access and ensure his link becomes invalid
    When I click on the "revoke invite icon for james@acme.com"
    When I press "Delete" within "a dialog"
    Then I should see the following data in column 1 of "invite user table rows" table:
      | jane@acme.com     |
      | jim@acme.com      |
      | michael@acme.com  |
    When I follow "Sign out"
      And "james@acme.com" opens the email with subject "Invite to join easyBacklog"
    Then they should see "John from Acme has invited you" in the email body
      And they should see "Hi james@acme.com" in the email body
    When they click the first link in the email
    Then I should see "Invalid invite" within the "primary page heading"

    # now test an unregistered user following the link and signing up
    When "michael@acme.com" opens the email with subject "Invite to join easyBacklog"
    Then they should see "John from Acme has invited you" in the email body
      And they should see "Hi michael@acme.com" in the email body
    When they click the first link in the email
    Then I should see "Get access to account" within the "primary page heading"
      And I should see "Acme" within the "primary page heading"
    When I press "Register"
    Then I should see "Please enter your full name" within the "sign up form"
      And I should see "This field is required"
    When I fill in "Full name" with "Michael"
      And I fill in "Sign Up Email" using Javascript with "John@acme.com"
      And I fill in "Password" with "password"
      And I press "Register"
    Then I should see "Someone is already registered with that email address." within the "sign up form"
      And I should see "The password confirmation is not the same"
    When I fill in "Email" with "michael@acme.com"
      And I fill in "Password confirmation" with "password"
      And I press "Register"
    Then I should see "You've now got access to “Acme”" within the "primary page heading"
    When I follow "View the Acme account"
    Then I should see "Acme" within the "primary page heading"
      And I should not see "Users" within the "top nav"

    # now test a registered user receiving an invite link to another account
    When I follow "Sign out"
    Given a user named "Jim" is registered
      And I am signed in as "Jim"
    When "jim@acme.com" opens the email with subject "Invite to join easyBacklog"
    When they click the first link in the email
    Then I should see "You've now got access to “Acme”" within the "primary page heading"

    # then test for someone who already has access, logged in as Jim already, so lets use that account
    When "jane@acme.com" opens the email with subject "Invite to join easyBacklog"
    When they click the first link in the email
    Then I should see "Access already granted" within the "primary page heading"

    # then check the links no longer work
    When I follow "Sign out"
      And "jim@acme.com" opens the email with subject "Invite to join easyBacklog"
    When they click the first link in the email
    Then I should see "Invalid invite" within the "primary page heading"
