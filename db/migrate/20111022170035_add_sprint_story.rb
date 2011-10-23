class AddSprintStory < ActiveRecord::Migration
  # Correction from previous migration
  # As we need sprint stories to maintain their own order, we unfortunately need to have an intermediate table between sprints & stories
  # that has it's own position column
  def self.up
    remove_index :stories, :sprint_id
    remove_column :stories, :sprint_score_50_when_assigned
    remove_column :stories, :sprint_score_90_when_assigned
    remove_column :stories, :sprint_status_id
    remove_column :stories, :sprint_id
    create_table :sprint_stories, :force => true do |t|
      t.integer :sprint_id, :null => false
      t.integer :story_id, :null => false
      t.integer :position
      t.integer :sprint_score_50_when_assigned
      t.integer :sprint_score_90_when_assigned
      t.integer :sprint_story_status_id
      t.timestamps
    end
    add_index :sprint_stories, [:sprint_id, :story_id]
    add_index :sprint_stories, :sprint_id
    add_index :sprint_stories, :story_id
    rename_table :sprint_statuses, :sprint_story_statuses
  end

  def self.down
    rename_table :sprint_story_statuses, :sprint_statuses
    remove_index :sprint_stories, [:sprint_id, :story_id]
    remove_index :sprint_stories, :sprint_id
    remove_index :sprint_stories, :story_id
    drop_table :sprint_stories
    add_column :stories, :sprint_status_id, :integer
    add_column :stories, :sprint_score_90_when_assigned, :integer
    add_column :stories, :sprint_score_50_when_assigned, :integer
    add_index :stories, :sprint_id
    add_column :stories, :sprint_id, :integer
    remove_column :stories, :sprint_position
  end
end
