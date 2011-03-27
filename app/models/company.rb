class Company < ActiveRecord::Base
  has_many :company_users
  has_many :users, :through => :company_users
  has_many :backlogs
  has_many :invited_users
  belongs_to :locale

  validates_uniqueness_of :name
  validates_presence_of :name, :default_rate, :default_velocity, :locale
  validates_numericality_of :default_rate, :default_velocity

  attr_accessible :name, :default_rate, :default_velocity, :locale_id
end