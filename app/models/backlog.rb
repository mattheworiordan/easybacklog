class Backlog < ActiveRecord::Base
  belongs_to :account
  belongs_to :author, :class_name => 'User'
  belongs_to :last_modified_user, :class_name => 'User'
  belongs_to :company
  belongs_to :snapshot_for_sprint, :class_name => 'Sprint'

  has_many :themes, :dependent => :destroy, :order => 'position'
  has_many :sprints, :dependent => :destroy, :order => 'iteration'
  has_many :backlog_users, :dependent => :destroy

  # self references for snapshots
  has_many :snapshots, :class_name => 'Backlog', :conditions => ['deleted <> ?', true], :foreign_key => 'snapshot_master_id', :order => 'created_at desc', :dependent => :destroy
  belongs_to :snapshot_master, :class_name => 'Backlog'

  validates_presence_of :name
  validates_numericality_of :rate, :velocity, :greater_than => 0, :allow_nil => true

  attr_accessible :account, :name, :rate, :velocity, :use_50_90, :scoring_rule_id

  before_save :check_can_modify, :remove_rate_if_velocity_empty, :update_sprint_estimation_method
  after_save :update_account_scoring_rule_if_empty

  can_do :inherited_privilege => [:company, :account]

  scope :available, where(:deleted => false)
  scope :active, where(:archived => false).where(:deleted => false)
  scope :deleted, where(:deleted => true)
  scope :archived, where(:archived => true).where(:deleted => false)
  scope :masters, where('snapshot_master_id IS NULL and snapshot_for_sprint_id IS NULL')
  scope :where_user_has_access, lambda { |user|
    sql = <<-SQL
    (
      /* check for users with admin privileges, they can do anything */
      account_id IN (SELECT account_id FROM account_users AS au WHERE au.user_id = :user_id AND au.admin = :true))
      OR
      /* check for users with read-full privileges so long as a company none privilege does not exist */
      ( account_id IN (SELECT account_id FROM account_users AS au WHERE au.user_id = :user_id AND (au.privilege IN ('read','readstatus','full')))
        AND (company_ID IS NULL OR (company_ID IS NOT NULL AND company_ID NOT IN (SELECT company_id FROM company_users AS au WHERE au.user_id = :user_id AND au.privilege = 'none'))) )
      OR
      /* check if user has read-full privileges for the company if it exists */
      ( company_id IS NOT NULL AND company_ID IN (select company_id from company_users as au where au.user_id = :user_id and (au.privilege in ('read','readstatus','full')) )
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
      new_theme = theme.clone
      destination.themes << new_theme
      theme.stories.each do |story|
        new_story = story.clone
        new_theme.stories << new_story
        story.acceptance_criteria.each do |criterion|
          new_story.acceptance_criteria << criterion.clone
        end
      end
    end
  end

  # snapshot is a non-editable copy of a backlog in time
  def create_snapshot(snapshot_name)
    new_backlog = account.backlogs.new(self.attributes.merge({ :name => snapshot_name, :created_at => Time.now, :updated_at => Time.now }))
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

  def is_snapshot?
    self.snapshot_master.present? || self.snapshot_for_sprint.present?
  end

  # useful flag to indicate whether backlog is locked because it's a snapshot or an archive or deleted
  def locked?
    !editable?
  end
  alias_method :is_locked, :locked?

  # independent backlog master link regardless of whether sprint snapshot or normal snapshot
  def backlog_root
    if self.snapshot_for_sprint.present?
      self.snapshot_for_sprint.backlog
    else
      self.snapshot_master
    end
  end

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

  def sprint_snapshots
    sprints.sort_by(&:iteration).reverse.map(&:snapshot).reject { |s| s.blank? }
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

  private
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