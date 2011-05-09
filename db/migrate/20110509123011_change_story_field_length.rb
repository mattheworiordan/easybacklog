class ChangeStoryFieldLength < ActiveRecord::Migration
  def self.up
    change_column :stories, :i_want_to, :string, :length => 2048
    change_column :stories, :so_i_can, :string, :length => 2048
    change_column :stories, :comments, :text
  end

  def self.down
    change_column :stories, :comments, :string
    change_column :stories, :so_i_can, :string
    change_column :stories, :i_want_to, :string
  end
end
