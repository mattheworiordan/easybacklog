class Company < ActiveRecord::Base
  has_many :company_users
  has_many :users, :through => :company_users
  has_many :backlogs

  validates_uniqueness_of :name
  validates_presence_of :name
end