class CreateStory < ActiveRecord::Migration
  def self.up
    create_table :stories, :force => true do |t|
      t.integer :theme_id, :null => false
      t.integer :unique_id, :null => false
      t.string :as_a
      t.string :i_want_to
      t.string :so_i_can
      t.string :comments
      t.integer :score_50
      t.integer :score_90
      t.integer :position, :null => false
      t.timestamps
    end
    add_index :stories, :as_a
    add_index :stories, :theme_id
    add_index :stories, [:theme_id, :unique_id], :unique => true
  end

  def self.down
    remove_index :stories, :theme_id
    remove_index :stories, :as_a
    drop_table :stories
  end
end
