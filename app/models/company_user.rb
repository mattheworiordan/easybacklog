class CompanyUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :company
  validates_presence_of :user_id, :company_id
  validates_inclusion_of :admin, :in => [true, false]
end