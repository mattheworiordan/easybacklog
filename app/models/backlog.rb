class Backlog < ActiveRecord::Base
  belongs_to :account
  belongs_to :author, :class_name => 'User'
  belongs_to :last_modified_user, :class_name => 'User'
  belongs_to :company
  belongs_to :snapshot_for_sprint, :class_name => 'Sprint'

  has_many :themes, :dependent => :destroy, :order => 'position'
  has_many :sprints, :dependent => :destroy, :order => 'iteration'
  has_many :sprint_snapshots, :source => :snapshot, :conditions => ['deleted <> ?', true], :through => :sprints, :order => 'sprints.iteration desc'
  has_many :backlog_users, :dependent => :destroy
  has_many :backlog_user_settings, :dependent => :destroy

  # self references for snapshots
  has_many :snapshots, :class_name => 'Backlog', :conditions => ['deleted <> ?', true], :foreign_key => 'snapshot_master_id', :order => 'created_at desc', :dependent => :destroy
  belongs_to :snapshot_master, :class_name => 'Backlog'

  validates_presence_of :name
  validates_numericality_of :rate, :velocity, :greater_than => 0, :allow_nil => true

  attr_accessible :account, :name, :rate, :velocity, :use_50_90, :scoring_rule_id

  before_save :check_can_modify, :remove_rate_if_velocity_empty, :update_sprint_estimation_method
  after_save :update_account_scoring_rule_if_empty

  can_do :privileges => :backlog_users, :inherited_privilege => [:company, :account]

  scope :available, where(:deleted => false)
  scope :active, available.where(:archived => false)
  scope :deleted, where(:deleted => true)
  scope :archived, available.where(:archived => true)
  scope :masters, where('snapshot_master_id IS NULL and snapshot_for_sprint_id IS NULL')
  scope :where_user_has_access, lambda { |user|
    sql = <<-SQL
    (
      /* check for users with admin privileges, they can do anything */
      account_id IN (SELECT account_id FROM account_users AS au WHERE au.user_id = :user_id AND au.admin = :true))
      OR
      /* check for users with read-full privileges so long as a company/backlog none privilege does not exist */
      ( account_id IN (SELECT account_id FROM account_users AS au WHERE au.user_id = :user_id AND (au.privilege IN ('read','readstatus','full')))
        AND (
          (company_ID IS NULL OR
            (
              /* backlog belongs to company, check company permissions */
              company_ID IS NOT NULL AND (
                /* ensure company none privilege not set */
                company_ID NOT IN (SELECT company_id FROM company_users AS au WHERE au.user_id = :user_id AND au.privilege = 'none')
                OR
                /* however if read-full set for account level let this supercede */
                backlogs.ID IN (SELECT backlog_id FROM backlog_users AS bu WHERE bu.user_id = :user_id AND bu.privilege IN ('read','readstatus','full'))
              )
            )
          )
        )
        AND (
          /* if backlog privilege set to none then we can't show this backlog */
          backlogs.ID NOT IN (SELECT backlog_id FROM backlog_users AS bu WHERE bu.user_id = :user_id AND bu.privilege = 'none')
        )
      )
      OR
      /* check if user has read-full privileges for the company if it exists */
      ( company_id IS NOT NULL AND (
          company_ID IN (select company_id from company_users as au where au.user_id = :user_id and (au.privilege in ('read','readstatus','full'))
          AND
          /* ensure company permission not overwritten by backlog permission */
          backlogs.ID NOT IN (SELECT backlog_id FROM backlog_users AS bu WHERE bu.user_id = :user_id AND bu.privilege = 'none')
        )
      )
      OR
      /* user has backlog specific permission to view this backlog */
      backlogs.ID IN (SELECT backlog_id FROM backlog_users AS bu WHERE bu.user_id = :user_id AND bu.privilege IN ('read','readstatus','full'))
    )
    SQL
    where(sql, { :user_id => user.id, :true => true })
  }

  include ScoreStatistics

  def days
    themes.inject(0) { |val, theme| val + theme.days } if days_estimatable?
  end

  def points
    themes.inject(0) { |val, theme| val + theme.points }
  end

  def cost
    themes.inject(0) { |val, theme| val + theme.cost } if cost_estimatable?
  end

  def cost_formatted
    (cost || 0).to_currency(:precision => 0, :locale => account.locale.code.to_s)
  end

  def rate_formatted
    (rate || 0).to_currency(:precision => 0, :locale => account.locale.code.to_s)
  end

  def days_formatted
    format('%0.1f', days)
  end

  # check if backlog rate & velocity set to calculate rate
  def cost_estimatable?
    rate.present? && velocity.present?
  end

  def days_estimatable?
    velocity.present?
  end

  def all_sprints_team_velocity_estimatable?
    sprints.all? { |sprint| sprint.team_velocity_estimatable? }
  end

  def average_velocity
    if sprints.completed.present?
      sprints.completed.inject(0.0) { |sum, d| sum += d.actual_velocity } / sprints.completed.length.to_f
    else
      velocity
    end
  end

  # simply copy all themes, stories and acceptance criteria to destination backlog
  def copy_children_to_backlog(destination)
    self.themes.each do |theme|
      new_theme = theme.dup
      destination.themes << new_theme
      theme.stories.each do |story|
        new_story = story.dup
        new_theme.stories << new_story
        story.acceptance_criteria.each do |criterion|
          new_story.acceptance_criteria << criterion.dup
        end
      end
    end
  end

  def safe_attributes
    attributes = self.attributes.select { |key, val| self.class.accessible_attributes.include?(key) }
  end

  # snapshot is a non-editable copy of a backlog in time
  def create_snapshot(snapshot_name)
    new_backlog = account.backlogs.new(safe_attributes.merge({ :name => snapshot_name }))
    # these 2 attributes are protected
    new_backlog.author = self.author
    new_backlog.last_modified_user = self.last_modified_user
    new_backlog.save!

    # copy the children
    self.copy_children_to_backlog new_backlog

    # now lock the record and assign the snapshot master to self
    new_backlog.snapshot_master = self
    new_backlog.save!

    new_backlog
  end

  # editable if this not a snapshot i.e. a snapshot master exists
  #  or if deleted or archived
  def editable?
    # allow an archived and deleted backlog to be editable so that it can be destroyed, else editable? blocks all destroy
    snapshot_master.blank? && snapshot_for_sprint.blank? && ((!self.archived? && !self.deleted?) || (self.archived? && self.deleted?))
  end
  alias_method :is_editable, :editable?

  def all_snapshot_master
    self.snapshot_master || self.snapshot_for_sprint
  end
  alias_method :backlog_root, :all_snapshot_master

  def all_snapshot_id
    all_snapshot_master.id
  end
  alias_method :parent_backlog_id, :all_snapshot_id
  alias_method :parent_sprint_id, :all_snapshot_id

  def is_snapshot?
    self.snapshot_master.present? || self.snapshot_for_sprint.present?
  end

  # useful flag to indicate whether backlog is locked because it's a snapshot or an archive or deleted
  def locked?
    !editable?
  end
  alias_method :is_locked, :locked?

  def update_meta_data(user)
    self.updated_at = Time.now
    self.last_modified_user = user
    self.save!
  end

  def compare_with(target)
    BacklogComparator.new(self, target)
  end

  # override delete and mark record as deleted
  def mark_deleted(deleted = true)
    Backlog.record_timestamps = false
    self.deleted = deleted
    save!
    Backlog.record_timestamps = true
  end

  def recover_deleted
    mark_deleted(false)
  end

  # mark record as archived
  def mark_archived(archived = true)
    Backlog.record_timestamps = false
    self.archived = archived
    save!
    Backlog.record_timestamps = true
  end

  def recover_from_archive
    mark_archived(false)
  end

  def has_company?
    !company.blank?
  end

  # allow search for a story using full code such as ABC001
  def find_story_by_code_and_unique_id(code)
    theme_code = code[0..2]
    story_unique_id = code[3..5].to_i
    themes.find_by_code(theme_code).stories.find_by_unique_id(story_unique_id)
  end

  # if no scoring rule exists, check account for a rule
  def scoring_rule
    if scoring_rule_id.blank?
      account.scoring_rule
    else
      ScoringRule.find scoring_rule_id
    end
  end

  # return an array of valid scores based on scoring rule, or nil if any score is valid
  def valid_scores
    scoring_rule.valid_scores
  end

  # it's impossible to destroy a backlog's snapshots as they are not editable and Snapshot module prevents deletion
  # so we mark all snapshots as deleted and no longer as snapshots, and then delete them
  # and then we do the same to this backlog
  #
  def destroy_including_snapshots
    # go through sprints and delete snapshots
    sprints.each do |sprint|
      if sprint.snapshot.present?
        # mark snapshot as deleted and no longer a snapshot as snapshots cannot be deleted
        sprint.snapshot.update_attribute :deleted, true # ensure it does not appear whilst we are deleting this item
        sprint.snapshot.update_attribute :archived, true # archived & deleted backlogs are editable (special workaround)
        sprint.snapshot.update_attribute :snapshot_for_sprint_id, nil
        sprint.snapshot.destroy
      end
    end

    snapshots.each do |snapshot|
      # mark snapshot as deleted and no longer a snapshot as snapshots cannot be deleted
      snapshot.update_attribute :deleted, true # ensure it does not appear whilst we are deleting this item
      snapshot.update_attribute :archived, true # archived & deleted backlogs are editable (special workaround)
      snapshot.update_attribute :snapshot_master_id, nil
      snapshot.destroy
    end

    update_attribute :deleted, true
    update_attribute :archived, true # archived & deleted backlogs are editable (special workaround)
    destroy
  end

  def add_or_update_user(user, privilege)
    privilege = Privilege.find(privilege) unless privilege.kind_of?(Privilege)
    backlog_user = backlog_users.where(:user_id => user.id)
    if backlog_user.present?
      backlog_user.first.update_attributes! :privilege => privilege.code
    else
      backlog_users.create! :user_id => user.id, :privilege => privilege.code
    end
  end

  def delete_user(user)
    backlog_users.where(:user_id => user.id).each { |cu| cu.delete }
  end

  def as_json(options={})
    super(serialized_options(options))
  end
  def to_xml(options={})
    super(serialized_options(options.deeper_merge(:root => is_snapshot? ? 'snapshot' : 'backlog')))
  end

  private
    def serialized_options(super_options)
      options = { :except => [:snapshot_master_id, :snapshot_for_sprint_id, :deleted] }
      options.deeper_merge({ :except => [:account_id, :company_id, :archived, :author_id, :last_modified_user_id, :updated_at] }) if is_snapshot?
      if snapshot_master.present?
        options[:methods] = [:parent_backlog_id]
        super_options[:methods].delete :parent_sprint_id if super_options[:methods] # odd bug where as_json on second request passes in options from first request
      elsif snapshot_for_sprint.present?
        options[:methods] = [:parent_sprint_id]
        super_options[:methods].delete :parent_backlog_id if super_options[:methods] # odd bug where as_json on second request passes in options from first request
      end
      super_options.deeper_merge(options)
      super_options
    end

    # only allow save on working copy i.e. not snapshot
    #  but do allow editing if snapshot_master, snapshot_for_sprint, archived or deleted has changed
    #  snapshot_master is needed so that the snapshot can be created without an error blocking editing being thrown
    def check_can_modify
      editable? || snapshot_master_id_changed? || archived_changed? || deleted_changed? || snapshot_for_sprint_id_changed?
    end

    def update_account_scoring_rule_if_empty
      unless scoring_rule_id.blank?
        account.update_attributes :scoring_rule_id => scoring_rule_id if account.scoring_rule_id.blank?
      end
    end

    def remove_rate_if_velocity_empty
      self.rate = nil if velocity.blank?
    end

    # if average velocity for this backlog is removed, then all existing sprints will need to be
    # modified to use explicit velocities as they can no longer calculate their expected velocity
    # based on the backlog velocity
    def update_sprint_estimation_method
      if velocity_changed? && velocity.blank?
        sprints.each { |sprint| sprint.convert_to_explicit_velocity }
      end
    end
end