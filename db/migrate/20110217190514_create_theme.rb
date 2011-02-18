class CreateTheme < ActiveRecord::Migration
  def self.up
    create_table :themes, :force => true do |t|
      t.integer :backlog_id
      t.string :name
      t.string :code
      t.integer :position
      t.timestamps
    end
    add_index :themes, :backlog_id
  end

  def self.down
    remove_index :themes, :backlog_id
    drop_table :themes
  end
end
