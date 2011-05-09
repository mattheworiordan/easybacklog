class ChangeCriteriaFieldLength < ActiveRecord::Migration
  def self.up
    change_column :acceptance_criteria, :criterion, :text
  end

  def self.down
    change_column :acceptance_criteria, :criterion, :string
  end
end
