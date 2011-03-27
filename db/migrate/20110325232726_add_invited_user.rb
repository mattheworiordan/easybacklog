class AddInvitedUser < ActiveRecord::Migration
  def self.up
    create_table :invited_users, :force => true do |t|
      t.string :email, :null => false
      t.integer :company_id, :null => false
      t.integer :invitee_user_id, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :invited_users
  end
end
