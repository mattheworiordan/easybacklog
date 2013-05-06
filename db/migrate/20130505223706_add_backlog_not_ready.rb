class AddBacklogNotReady < ActiveRecord::Migration
  def change
    add_column :backlogs, :not_ready_status, :string
    add_column :backlogs, :not_ready_since, :date
  end
end
