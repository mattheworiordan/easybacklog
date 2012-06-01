class SprintStoriesIndex < ActiveRecord::Migration
  def up
    remove_index :sprint_stories, :story_id
    add_index :sprint_stories, :story_id, :unique => true
  end

  def down
    remove_index :sprint_stories, :story_id
    add_index :sprint_stories, :story_id
  end
end
