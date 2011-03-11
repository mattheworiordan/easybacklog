class AcceptanceCriterion < ActiveRecord::Base
  acts_as_list

  belongs_to :story

  attr_accessible :criterion, :position
end