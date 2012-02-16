class CreateCompanyUsers < ActiveRecord::Migration
  def self.up
    create_table :company_users do |t|
      t.references :company, :null => false
      t.references :user, :null => false
      t.string :privilege
      t.timestamps
    end
    add_index :company_users, [:company_id, :user_id]
    add_index :company_users, :user_id
    add_index :company_users, :company_id

    # account user table does not have indexes on just user_id or account_id
    add_index :account_users, :user_id
    add_index :account_users, :account_id
  end

  def self.down
    remove_index :account_users, :user_id
    remove_index :account_users, :account_id

    remove_index :company_users, [:company_id, :user_id]
    remove_index :company_users, :user_id
    remove_index :company_users, :company_id

    drop_table :company_users
  end
end
