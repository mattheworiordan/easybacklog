class Backlog < ActiveRecord::Base
  belongs_to :company
  belongs_to :author, :class_name => 'User'
  belongs_to :last_modified_user, :class_name => 'User'

  #has_many :stories, :dependent => :delete_all

  validates_uniqueness_of :name, :scope => [:company_id]
  validates_presence_of :name

  def copy_children_to_backlog(destination)
    # TODO: Implement copying of children records to destination
  end
end