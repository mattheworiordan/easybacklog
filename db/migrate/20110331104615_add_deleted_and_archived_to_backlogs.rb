class AddDeletedAndArchivedToBacklogs < ActiveRecord::Migration
  def self.up
    add_column :backlogs, :deleted, :boolean, :null => false, :default => false
    add_column :backlogs, :archived, :boolean, :null => false, :default => false
  end

  def self.down
    remove_column :backlogs, :archived
    remove_column :backlogs, :deleted
  end
end
