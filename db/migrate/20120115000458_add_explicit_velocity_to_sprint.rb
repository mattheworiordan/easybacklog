class AddExplicitVelocityToSprint < ActiveRecord::Migration
  def self.up
    add_column :sprints, :explicit_velocity, :decimal, :precision => 5, :scale => 1
    change_column :sprints, :number_team_members, :decimal, :precision => 5, :scale => 1
  end

  def self.down
    change_column :sprints, :number_team_members, :integer
    remove_column :sprints, :explicit_velocity
  end
end
