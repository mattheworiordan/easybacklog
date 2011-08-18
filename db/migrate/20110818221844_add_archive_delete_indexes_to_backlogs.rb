class AddArchiveDeleteIndexesToBacklogs < ActiveRecord::Migration
  def self.up
    add_index :backlogs, :deleted
    add_index :backlogs, :archived
  end

  def self.down
    remove_index :backlogs, :archived
    remove_index :backlogs, :deleted
  end
end
