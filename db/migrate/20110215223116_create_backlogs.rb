class CreateBacklogs < ActiveRecord::Migration
  def self.up
    create_table :backlogs, :force => true do |t|
      t.string :name, :null => false
      t.integer :company_id, :null => false
      t.integer :author_id, :null => false
      t.integer :last_modified_user_id, :null => false
      t.timestamps
    end
    add_index :backlogs, :company_id
  end

  def self.down
    remove_index :backlogs, :company_id
    drop_table :backlogs
  end
end
