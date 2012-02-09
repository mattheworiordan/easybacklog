class AddPriviligesToAccountUsers < ActiveRecord::Migration
  def self.up
    add_column :invited_users, :privilege, :string
    add_column :account_users, :privilege, :string
  end

  def self.down
    # remove_column :account_users, :privilege
    remove_column :invited_users, :privilege
  end
end
