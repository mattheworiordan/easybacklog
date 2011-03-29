class AddSnapshotToBacklog < ActiveRecord::Migration
  def self.up
    add_column :backlogs, :snapshot_master_id, :integer
    add_index :backlogs, :snapshot_master_id
  end

  def self.down
    remove_index :backlogs, :snapshot_master_id
    remove_column :backlogs, :snapshot_master_id
  end
end
