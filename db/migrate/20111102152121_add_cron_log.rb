class AddCronLog < ActiveRecord::Migration
  def self.up
    create_table :cron_logs, :force => true do |t|
      t.string :message
      t.text :info
      t.timestamps
    end
    add_index :cron_logs, :created_at
  end

  def self.down
    remove_index :cron_logs, :created_at
    drop_table :cron_logs
  end
end
