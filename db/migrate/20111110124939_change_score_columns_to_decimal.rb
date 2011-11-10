class ChangeScoreColumnsToDecimal < ActiveRecord::Migration
  def self.up
    change_column :stories, :score_50, :decimal, :precision => 5, :scale => 1
    change_column :stories, :score_90, :decimal, :precision => 5, :scale => 1
    change_column :sprint_stories, :sprint_score_50_when_assigned, :decimal, :precision => 5, :scale => 1
    change_column :sprint_stories, :sprint_score_90_when_assigned, :decimal, :precision => 5, :scale => 1
  end

  def self.down
    change_column :sprint_stories, :sprint_score_90_when_assigned, :integer
    change_column :sprint_stories, :sprint_score_50_when_assigned, :integer
    change_column :stories, :score_90, :integer
    change_column :stories, :score_50, :integer
  end
end
