class AddAdminRightsToUser < ActiveRecord::Migration
  def self.up
    add_column :users, :admin_rights, :boolean
  end

  def self.down
    remove_column :users, :admin_rights
  end
end
