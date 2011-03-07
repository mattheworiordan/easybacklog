class MakePositionNullable < ActiveRecord::Migration
  def self.up
    change_column :stories, :position, :integer, :null => true
    change_column :acceptance_criteria, :position, :integer, :null => true
  end

  def self.down
    change_column :acceptance_criteria, :position, :integer, :null => false
    change_column :stories, :position, :integer, :null => false
  end
end
