class SprintStoryStatus < ActiveRecord::Base
  DONE_CODE = 'D'

  has_many :sprint_stories

  validates_presence_of :status, :code
  validates_uniqueness_of :status, :code
end