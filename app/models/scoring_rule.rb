class ScoringRule < ActiveRecord::Base
  FIBONACCI = 'F' # 0, 1, 2, 3, 5, 8, 13, 21
  MODIFIED_FIB = 'M' # 0, 0.5, 1, 2, 3, 5, 8, 13, 20/21, 40, 100
  ANY = 'A' # 0 and up

  has_many :backlogs
  has_many :accounts

  acts_as_list

  validates_presence_of :description, :code, :title
  validates_uniqueness_of :description, :code, :title

  def self.default
    ScoringRule.find_by_code('M')
  end
end