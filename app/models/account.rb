class Account < ActiveRecord::Base
  has_many :account_users, :dependent => :destroy
  has_many :users, :through => :account_users
  has_many :backlogs, :conditions => 'snapshot_master_id IS NULL and snapshot_for_sprint_id IS NULL', :dependent => :destroy
  has_many :invited_users, :dependent => :destroy
  has_many :companies, :dependent => :destroy
  belongs_to :locale
  belongs_to :scoring_rule

  validates_uniqueness_of :name
  validates_presence_of :name, :locale
  validates_numericality_of :default_rate, :default_velocity, :greater_than_or_equal_to => 0, :allow_nil => true

  attr_accessible :name, :default_rate, :default_velocity, :locale_id, :default_use_50_90, :scoring_rule_id

  before_save :remove_rate_if_velocity_empty
  before_update :enable_defaults_set

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

  # add an example backlog for new accounts
  def add_example_backlog(author)
    example_data = XMLObject.new(Rails.root.join('db/samples/new_account_backlog.xml'))
    backlog_builder = Creators::BacklogCreator.new
    backlog_builder.create example_data, self, author
  end

  # if no scoring rule exists, use default
  def scoring_rule
    if scoring_rule_id.blank?
      ScoringRule.default
    else
      ScoringRule.find scoring_rule_id
    end
  end

  def days_estimatable?
    default_velocity.present?
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

    def remove_rate_if_velocity_empty
      self.default_rate = nil if default_velocity.blank?
    end

    # when an account is create, defaults have not yet been set for the account, however once the account is
    # updated, then we know the user has set the defaults so we can use those defaults moving forwards
    def enable_defaults_set
      self.defaults_set = true unless defaults_set_changed?
    end
end