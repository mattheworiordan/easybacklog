class AddVelocityAndRateToBacklogAndCompany < ActiveRecord::Migration
  def self.up
    add_column :companies, :default_velocity, :decimal, :precision => 6, :scale => 1, :default => 3
    add_column :companies, :default_rate, :integer, :default => 800
    add_column :companies, :locale_id, :integer
    add_column :backlogs, :velocity, :decimal, :precision => 6, :scale => 1, :default => 3
    add_column :backlogs, :rate, :integer, :default => 800

    change_column :companies, :default_velocity, :decimal, :precision => 6, :scale => 1, :required => true
    change_column :companies, :default_rate, :integer, :required => true
    change_column :backlogs, :velocity, :decimal, :precision => 6, :scale => 1, :required => true
    change_column :backlogs, :rate, :integer, :required => true
  end

  def self.down
    remove_column :backlogs, :rate
    remove_column :backlogs, :velocity
    remove_column :companies, :locale_id
    remove_column :companies, :default_rate
    remove_column :companies, :default_velocity
  end
end
