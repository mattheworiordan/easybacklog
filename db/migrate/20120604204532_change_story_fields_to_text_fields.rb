class ChangeStoryFieldsToTextFields < ActiveRecord::Migration
  def up
    change_column :stories, :i_want_to, :text
    change_column :stories, :so_i_can, :text
  end

  def down
    change_column :stories, :i_want_to, :string
    change_column :stories, :so_i_can, :string
  end
end
