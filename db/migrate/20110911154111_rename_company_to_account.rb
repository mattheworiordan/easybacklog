class RenameCompanyToAccount < ActiveRecord::Migration
  def self.up
    remove_index :backlogs, :company_id
    remove_index :company_users, [:company_id, :user_id]
    rename_table :companies, :accounts
    rename_table :company_users, :account_users
    rename_column :backlogs, :company_id, :account_id
    rename_column :account_users, :company_id, :account_id
    rename_column :invited_users, :company_id, :account_id
    add_index :backlogs, :account_id
    add_index :account_users, [:account_id, :user_id]
  end

  def self.down
    remove_index :account_users, [:account_id, :user_id]
    remove_index :backlogs, :account_id
    rename_column :invited_users, :account_id, :company_id
    rename_column :account_users, :account_id, :company_id
    rename_column :backlogs, :account_id, :company_id
    rename_table :account_users, :company_users
    rename_table :accounts, :companies
    add_index :company_users, [:company_id, :user_id]
    add_index :backlogs, :company_id
  end
end
