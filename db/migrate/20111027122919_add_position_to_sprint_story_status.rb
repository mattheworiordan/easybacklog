class AddPositionToSprintStoryStatus < ActiveRecord::Migration
  def self.up
    add_column :sprint_story_statuses, :position, :integer
  end

  def self.down
    remove_column :sprint_story_statuses, :position
  end
end
