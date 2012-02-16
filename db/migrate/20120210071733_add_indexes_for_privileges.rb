class AddIndexesForPrivileges < ActiveRecord::Migration
  def self.up
    add_index :account_users, :privilege
    add_index :account_users, :admin
    add_index :company_users, :privilege
  end

  def self.down
    remove_index :account_users, :privilege
    remove_index :account_users, :admin
    remove_index :company_users, :privilege
  end
end
