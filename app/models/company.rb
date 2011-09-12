class Company < ActiveRecord::Base
  belongs_to :account
  has_many :backlogs

  validates_uniqueness_of :name, :scope => [:account_id], :message => 'has already been taken for another company'
  validates_presence_of :name, :default_rate, :default_velocity
  validates_numericality_of :default_rate, :default_velocity

  attr_accessible :name, :default_rate, :default_velocity, :default_use_50_90
end