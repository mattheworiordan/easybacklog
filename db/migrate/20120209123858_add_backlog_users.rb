class AddBacklogUsers < ActiveRecord::Migration
  def self.up
    create_table :backlog_users do |t|
      t.references :backlog, :null => false
      t.references :user, :null => false
      t.string :privilege
      t.timestamps
    end
    add_index :backlog_users, [:backlog_id, :user_id]
    add_index :backlog_users, :user_id
    add_index :backlog_users, :backlog_id

    # clear any backlog_users that may exist
    execute 'delete from backlog_users'

    # now assign full rights to every user for the Example backlog as by default they will get access to this in future
    Backlog.masters.where('name ilike ?', 'example corporate website backlog').each do |backlog|
      backlog.account.account_users.each do |account_user|
        execute "insert into backlog_users (backlog_id, user_id, privilege, created_at, updated_at) VALUES (#{backlog.id}, #{account_user.user_id}, 'full', now(), now())"
      end
    end
  end

  def self.down
    remove_index :backlog_users, [:backlog_id, :user_id]
    remove_index :backlog_users, :user_id
    remove_index :backlog_users, :backlog_id

    drop_table :backlog_users
  end
end
