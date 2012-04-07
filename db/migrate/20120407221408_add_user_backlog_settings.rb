class AddUserBacklogSettings < ActiveRecord::Migration
  def up
    create_table :backlog_user_settings do |t|
      t.references :backlog, :null => false
      t.references :user, :null => false
      t.string :filter
      t.string :collapsed_themes
    end
    add_index :backlog_user_settings, [:backlog_id, :user_id]
  end

  def self.down
    remove_index :backlog_user_settings, [:backlog_id, :user_id]
    drop_table :backlog_user_settings
  end
end
