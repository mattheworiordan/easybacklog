class Company < ActiveRecord::Base
  belongs_to :account
  has_many :backlogs, :conditions => 'snapshot_master_id IS NULL and snapshot_for_sprint_id IS NULL', :dependent => :destroy

  validates_uniqueness_of :name, :scope => [:account_id], :message => 'has already been taken for another company'
  validates_presence_of :name
  validates_numericality_of :default_rate, :default_velocity, :greater_than_or_equal_to => 0, :allow_nil => true

  attr_accessible :name, :default_rate, :default_velocity, :default_use_50_90

  before_save :remove_rate_if_velocity_empty

  def days_estimatable?
    default_velocity.present?
  end

  private
    def remove_rate_if_velocity_empty
      self.default_rate = nil if default_velocity.blank?
    end
end