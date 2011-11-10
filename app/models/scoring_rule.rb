class ScoringRule < ActiveRecord::Base
  FIBONACCI = 'F' # 0, 1, 2, 3, 5, 8, 13, 21, 34
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

  def is_score_valid?(score)
    if code == FIBONACCI
      if [0,0.5,1,2,3,5,8,13,21,34].include?(score)
        true
      else
        'is not valid according to the Fibonacci sequence'
      end
    elsif code == MODIFIED_FIB
      if [0,0.5,1,2,3,5,8,13,20,21,40,60,100].include?(score)
        true
      else
        'is not valid according to the modified Fibonacci sequence'
      end
    else
      if score >= 0
        true
      else
        'needs to be greater than or equal to zero'
      end
    end
  end

end