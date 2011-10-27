class SprintStoryStatus < ActiveRecord::Base
  DONE_CODE = 'D'
  DEFAULT_CODE = 'T' # default to to do

  has_many :sprint_stories

  acts_as_list

  validates_presence_of :status, :code
  validates_uniqueness_of :status, :code
end