class UpdatePrivilegesForExistingUsersAndInvites < ActiveRecord::Migration
  def self.up
    # for this upgrade, we assume everyone has full access rights
    AccountUser.update_all :privilege => 'full'
    InvitedUser.update_all :privilege => 'full'
  end

  def self.down
  end
end
