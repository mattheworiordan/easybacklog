class Story < ActiveRecord::Base
  acts_as_list

  belongs_to :theme

  has_many :acceptance_criteria, :dependent => :delete_all, :order => 'position'
end