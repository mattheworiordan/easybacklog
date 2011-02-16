class AddCompanyUsers < ActiveRecord::Migration
  def self.up
    create_table :company_users, :force => true do |t|
      t.integer :company_id, :null => false
      t.integer :user_id, :null => false
      t.boolean :admin, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :company_users
  end
end
