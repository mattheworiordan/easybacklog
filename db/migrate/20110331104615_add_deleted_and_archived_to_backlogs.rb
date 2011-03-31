class AddDeletedAndArchivedToBacklogs < ActiveRecord::Migration
  def self.up
    add_column :backlogs, :deleted, :boolean, :null => false, :default => false
    add_column :backlogs, :archived, :boolean, :null => false, :default => false
    add_index :backlogs, :deleted
    add_index :backlogs, :archived
  end

  def self.down
    remove_index :backlogs, :archived
    remove_index :backlogs, :deleted
    remove_column :backlogs, :archived
    remove_column :backlogs, :deleted
  end
end
