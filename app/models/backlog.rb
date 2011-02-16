class Backlog < ActiveRecord::Base
  belongs_to :company
  belongs_to :author, :class_name => 'User'
  belongs_to :last_modified_user, :class_name => 'User'

  validates_uniqueness_of :name, :scope => [:company_id]
  validates_presence_of :name
end