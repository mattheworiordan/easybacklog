class Add5090Default < ActiveRecord::Migration
  def self.up
    add_column :companies, :default_use_50_90, :boolean
    add_column :backlogs, :use_50_90, :boolean
    execute "update backlogs set use_50_90 = '1'"
    execute "update companies set default_use_50_90 = '1'"
  end

  def self.down
    remove_column :backlogs, :use_50_90
    remove_column :companies, :default_use_50_90
  end
end
