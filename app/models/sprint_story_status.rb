class SprintStoryStatus < ActiveRecord::Base
  ACCEPTED = 'D' # was done
  DEFAULT_CODE = 'T' # default to to do
  IN_PROGRESS = 'P'
  COMPLETED = 'R' # completed / ready for testing

  has_many :sprint_stories

  acts_as_list

  validates_presence_of :status, :code
  validates_uniqueness_of :status, :code

  def self.accepted
    find_by_code(ACCEPTED)
  end
end