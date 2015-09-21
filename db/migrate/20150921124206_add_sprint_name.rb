class AddSprintName < ActiveRecord::Migration
  def up
    add_column :sprints, :name, :string, null: true
  end

  def down
    remove_column :sprints, :name
  end
end
