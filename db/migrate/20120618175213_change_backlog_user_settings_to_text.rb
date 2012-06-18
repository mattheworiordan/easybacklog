class ChangeBacklogUserSettingsToText < ActiveRecord::Migration
  def up
  	change_column :backlog_user_settings, :collapsed_themes, :text
  end

  def down
  	change_column :backlog_user_settings, :collapsed_themes, :string
  end
end
