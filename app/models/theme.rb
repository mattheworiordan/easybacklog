class Theme < ActiveRecord::Base
  acts_as_list

  belongs_to :backlog

  has_many :stories, :dependent => :delete_all, :order => 'position'

  validates_uniqueness_of :name, :scope => [:backlog_id]
  validates_presence_of :name
  validates_uniqueness_of :code, :scope => [:backlog_id]
  validates_presence_of :code
end