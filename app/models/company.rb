class Company < ActiveRecord::Base
  has_many :company_users, :dependent => :destroy
  has_many :users, :through => :company_users
  has_many :backlogs, :conditions => 'snapshot_master_id IS NULL', :dependent => :destroy
  has_many :invited_users, :dependent => :destroy
  belongs_to :locale

  validates_uniqueness_of :name
  validates_presence_of :name, :default_rate, :default_velocity, :locale
  validates_numericality_of :default_rate, :default_velocity, :greater_than_or_equal_to => 0

  attr_accessible :name, :default_rate, :default_velocity, :locale_id

  def add_first_user(user)
    self.company_users.create!(:user => user, :admin => true)
  end

  def add_user(user)
    self.company_users.create!(:user => user, :admin => false)
  end
end