class AddSecurityCodeToInvitedUser < ActiveRecord::Migration
  def self.up
    InvitedUser.all.each { |d| d.destroy } # if we're running this migration now we don't need these old invites
    add_column :invited_users, :security_code, :string, :null => false, :default => 'aaaaaaaaaa'
    change_column_default :invited_users, :security_code, nil
  end

  def self.down
    change_column :invited_users, :security_code, :string, :null => false, :default => 'aaaaaaaaaa'
    remove_column :invited_users, :security_code
  end
end
