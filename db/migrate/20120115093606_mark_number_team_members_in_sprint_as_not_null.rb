class MarkNumberTeamMembersInSprintAsNotNull < ActiveRecord::Migration
  def self.up
    change_column :sprints, :number_team_members, :decimal, :precision => 6, :scale => 2, :null => true
  end

  def self.down
    # non reversible migration
    change_column :sprints, :number_team_members, :decimal, :precision => 5, :scale => 1, :null => false
  end
end
