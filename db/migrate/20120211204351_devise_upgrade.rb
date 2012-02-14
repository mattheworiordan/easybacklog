class DeviseUpgrade < ActiveRecord::Migration
  def up
    add_column :users, :reset_password_sent_at, :datetime
    remove_column :users, :remember_token
  end

  def down
    add_column :users, :remember_token, :string
    remove_column :users, :reset_password_sent_at
  end
end
