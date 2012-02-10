class AddIndexesForPrivileges < ActiveRecord::Migration
  def self.up
    add_index :account_users, :privilege
    add_index :account_users, :admin
    add_index :company_users, :privilege
  end

  def self.down
    drop_index :account_users, :privilege
    drop_index :account_users, :admin
    drop_index :company_users, :privilege
  end
end
