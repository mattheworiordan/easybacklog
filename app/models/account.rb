class Account < ActiveRecord::Base
  has_many :account_users, :dependent => :destroy, :inverse_of => :account
  has_many :users, :through => :account_users
  has_many :backlogs, :conditions => 'snapshot_master_id IS NULL and snapshot_for_sprint_id IS NULL', :dependent => :destroy, :inverse_of => :account
  has_many :invited_users, :dependent => :destroy, :inverse_of => :account
  has_many :companies, :dependent => :destroy, :inverse_of => :account
  belongs_to :locale, :inverse_of => :accounts
  belongs_to :scoring_rule

  validates_uniqueness_of :name
  validates_presence_of :name, :locale
  validates_numericality_of :default_rate, :default_velocity, :greater_than_or_equal_to => 0, :allow_nil => true

  attr_accessible :name, :default_rate, :default_velocity, :locale_id, :default_use_50_90, :scoring_rule_id

  before_validation :prohibit_rate_if_velocity_empty
  before_update :enable_defaults_set

  scope :with_backlog_counts, select(sanitize_sql(['accounts.id, accounts.name, (select count(*) from backlogs where account_id = accounts.id and snapshot_master_id is null and snapshot_for_sprint_id is null and archived <> ? and deleted <> ?) as cnt', true, true]))

  can_do :privileges => :account_users

  SERIALIZED_OPTIONS = { :except => [:defaults_set] }

  def add_user(user, privilege)
    self.account_users.create!(:user => user, :admin => false, :privilege => privilege.to_s )
  end

  def create_company(company_name, options = {})
    company = Company.find_or_create_by_name_and_account_id(company_name, self.id,
      :default_use_50_90 => options.has_key?(:default_use_50_90) ? options[:default_use_50_90] : default_use_50_90,
      :default_velocity => options.has_key?(:default_velocity) ? options[:default_velocity] : default_velocity,
      :default_rate => options.has_key?(:default_rate) ? options[:default_rate] : default_rate)
  end

  def active_backlogs_grouped_by_company(current_user)
    grouped_backlogs_by_company backlogs.active.where_user_has_access(current_user)
  end

  def archived_backlogs_grouped_by_company(current_user)
    grouped_backlogs_by_company backlogs.archived.where_user_has_access(current_user)
  end

  # new account set up, add example backlog and set up user as admin
  def setup_account_for_user(user)
    add_first_user user
    # add example backlog and ensure user has explicit read permissions
    example_backlog = add_example_backlog(user)
    example_backlog.add_or_update_user user, :full
  end

  # add an example backlog for new accounts
  def add_example_backlog(author, xml_file_name = 'new_account_backlog.xml')
    example_data = XMLObject.new(Rails.root.join("db/samples/#{xml_file_name}"))
    backlog_builder = Creators::BacklogCreator.new
    backlog_builder.create example_data, self, author
  end

  def add_first_user(user)
    self.account_users.create!(:user => user, :admin => true)
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

  def as_json(options={})
    super(options.deeper_merge(SERIALIZED_OPTIONS))
  end
  def to_xml(options={})
    super(options.deeper_merge(SERIALIZED_OPTIONS))
  end

  private
    def grouped_backlogs_by_company(backlog_list)
      list = backlog_list.order('LOWER(backlogs.name)').group_by do |backlog|
        backlog.company.present? ? backlog.company : backlog.account
      end
      list.sort_by do |key, val|
        # order by company with account company at top (i.e. no company)
        key == self ? '0' : key.name
      end
    end

    def prohibit_rate_if_velocity_empty
      errors.add :default_rate, "cannot be specified if default velocity is empty" if default_rate.present? && default_velocity.blank?
    end

    # when an account is create, defaults have not yet been set for the account, however once the account is
    # updated, then we know the user has set the defaults so we can use those defaults moving forwards
    def enable_defaults_set
      if !new_record?
        if default_velocity_changed? || default_rate_changed? || default_use_50_90_changed?
          self.defaults_set = true
        end
      end
    end
end