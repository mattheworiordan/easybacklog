class Account < ActiveRecord::Base
  has_many :account_users, :dependent => :destroy
  has_many :users, :through => :account_users
  has_many :backlogs, :conditions => 'snapshot_master_id IS NULL', :dependent => :destroy
  has_many :invited_users, :dependent => :destroy
  has_many :companies
  belongs_to :locale

  validates_uniqueness_of :name
  validates_presence_of :name, :default_rate, :default_velocity, :locale
  validates_numericality_of :default_rate, :default_velocity, :greater_than_or_equal_to => 0

  attr_accessible :name, :default_rate, :default_velocity, :locale_id, :default_use_50_90

  def add_first_user(user)
    self.account_users.create!(:user => user, :admin => true)
  end

  def add_user(user)
    self.account_users.create!(:user => user, :admin => false)
  end

  def create_company(company_name, options = {})
    company = Company.find_or_create_by_name_and_account_id(company_name, self.id,
      :default_use_50_90 => options.has_key?(:default_use_50_90) ? options[:default_use_50_90] : default_use_50_90,
      :default_velocity => options.has_key?(:default_velocity) ? options[:default_velocity] : default_velocity,
      :default_rate => options.has_key?(:default_rate) ? options[:default_rate] : default_rate)
  end

  def active_backlogs_grouped_by_company
    grouped_backlogs_by_company backlogs.active
  end

  def archived_backlogs_grouped_by_company
    grouped_backlogs_by_company backlogs.archived
  end

  private
    def grouped_backlogs_by_company(backlog_list)
      list = backlog_list.order('LOWER(name)').group_by do |backlog|
        backlog.company.present? ? backlog.company.name : backlog.account.name
      end
      list.sort_by do |key, val|
        # order by company with account company at top (i.e. no company)
        key == name ? '0' : key
      end
    end

end