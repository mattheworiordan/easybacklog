class AddCompanies < ActiveRecord::Migration
  def self.up
    create_table :companies, :force => true do |t|
      t.integer :account_id
      t.string :name
      t.decimal :default_velocity
      t.integer :default_rate
      t.boolean :default_use_50_90
      t.timestamps
    end
    add_index :companies, :account_id
    add_column :backlogs, :company_id, :integer
    add_index :backlogs, :company_id
  end

  def self.down
    remove_index :companies, :account_id
    remove_index :backlogs, :company_id
    remove_column :backlogs, :company_id
    drop_table :companies
  end
end
