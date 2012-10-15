class Company < ActiveRecord::Base
  belongs_to :account, :inverse_of => :companies
  has_many :backlogs, :conditions => 'snapshot_master_id IS NULL and snapshot_for_sprint_id IS NULL', :dependent => :destroy, :inverse_of => :company
  has_many :company_users, :dependent => :destroy, :inverse_of => :company

  validates_uniqueness_of :name, :scope => [:account_id], :message => 'has already been taken for another company'
  validates_presence_of :name
  validates_numericality_of :default_rate, :default_velocity, :greater_than_or_equal_to => 0, :allow_nil => true

  attr_accessible :name, :default_rate, :default_velocity, :default_use_50_90

  before_validation :prohibit_rate_if_velocity_empty

  can_do :privileges => :company_users, :inherited_privilege => :account

  def days_estimatable?
    default_velocity.present?
  end

  def add_or_update_user(user, privilege)
    privilege = Privilege.find(privilege) unless privilege.kind_of?(Privilege)
    company_user = company_users.where(:user_id => user.id)
    if company_user.present?
      company_user.first.update_attributes! :privilege => privilege.code
    else
      company_users.create! :user_id => user.id, :privilege => privilege.code
    end
  end

  def delete_user(user)
    company_users.where(:user_id => user.id).each { |cu| cu.delete }
  end

  private
    def prohibit_rate_if_velocity_empty
      errors.add :default_rate, "cannot be specified if default velocity is empty" if default_rate.present? && default_velocity.blank?
    end
end