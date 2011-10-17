class SprintStatus< ActiveRecord::Base
  DONE_CODE = 'D'

  belongs_to :sprint

  validates_presence_of :status, :code
  validates_uniqueness_of :status, :code
end