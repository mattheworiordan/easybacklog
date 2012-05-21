class NullableCriterion < ActiveRecord::Migration
  def up
    change_column :acceptance_criteria, :criterion, :text, :null => true
  end

  def down
    change_column :acceptance_criteria, :criterion, :text, :null => false
  end
end
