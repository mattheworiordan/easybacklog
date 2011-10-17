class AddSprint < ActiveRecord::Migration
  def self.up
    create_table :sprints, :force => true do |t|
      t.references :backlog, :null => false
      t.integer :iteration, :null => false
      t.date :start_on, :null => false
      t.integer :number_team_members, :null => false
      t.integer :duration_days, :null => false
      t.datetime :completed_at
      t.timestamps
    end
    add_index :sprints, :backlog_id

    add_column :stories, :sprint_id, :integer
    add_column :stories, :sprint_score_50_when_assigned, :integer
    add_column :stories, :sprint_score_90_when_assigned, :integer
    add_column :stories, :sprint_status_id, :integer
    add_index :stories, :sprint_id

    add_column :backlogs, :snapshot_for_sprint_id, :integer
    add_index :backlogs, :snapshot_for_sprint_id

    create_table :sprint_statuses, :force => true do |t|
      t.string :status
      t.string :code
    end
    add_index :sprint_statuses, :code
  end

  def self.down
    remove_index :sprint_statuses, :code
    drop_table :sprint_statuses

    remove_index :backlogs, :snapshot_for_sprint_id
    remove_column :backlogs, :snapshot_for_sprint_id

    remove_column :stories, :sprint_status_id
    remove_index :stories, :sprint_id
    remove_column :stories, :sprint_score_90_when_assigned
    remove_column :stories, :sprint_score_50_when_assigned
    remove_column :stories, :sprint_id

    remove_index :sprints, :backlog_id
    drop_table :sprints
  end
end
