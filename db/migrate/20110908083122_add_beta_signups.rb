class AddBetaSignups < ActiveRecord::Migration
  def self.up
    create_table :beta_signups, :force => true do |t|
      t.string :email
      t.string :company
      t.string :unique_code
      t.integer :clicks
      t.timestamps
    end
    add_index :beta_signups, :email
    add_index :beta_signups, :unique_code
  end

  def self.down
    remove_index :beta_signups, :unique_code
    remove_index :beta_signups, :email
    drop_table :beta_signups
  end
end
