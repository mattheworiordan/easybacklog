class SprintStoryStatus < ActiveRecord::Base
  DONE_CODE = 'D'
  DEFAULT_CODE = 'T' # default to to do
  IN_PROGRESS = 'P'
  TESTING = 'R' # ready for testing

  has_many :sprint_stories

  acts_as_list

  validates_presence_of :status, :code
  validates_uniqueness_of :status, :code

  def self.done
    find_by_code(DONE_CODE)
  end
end