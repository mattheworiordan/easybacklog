class RemoveCompanyColumn < ActiveRecord::Migration
  def self.up
    remove_column :users, :company
  end

  def self.down
    add_column :users, :company, :string
  end
end
