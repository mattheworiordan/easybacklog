class Sprint < ActiveRecord::Base
  belongs_to :backlog, :inverse_of => :sprints
  has_one :snapshot, :class_name => 'Backlog', :conditions => ['deleted <> ?', true], :foreign_key => 'snapshot_for_sprint_id', :inverse_of => :snapshot_for_sprint
  has_many :stories, :before_add => :check_editable_before_stories_changed, :before_remove => :check_editable_before_stories_changed, :through => :sprint_stories
  has_many :sprint_stories, :order => 'position ASC', :dependent => :destroy, :inverse_of => :sprint

  validates_uniqueness_of :iteration, :scope => [:backlog_id], :message => 'has already been taken for another sprint'
  validates_presence_of :iteration, :start_on, :duration_days
  validates_presence_of :number_team_members, :unless => lambda { |sprint| sprint.explicit_velocity.present? }
  validates_presence_of :explicit_velocity, :unless => lambda { |sprint| sprint.backlog.days_estimatable? }
  validates_numericality_of :duration_days, :iteration, :greater_than => 0, :message => 'must be a number greater than or equal to one'
  validates_numericality_of :number_team_members, :explicit_velocity, :greater_than => 0, :allow_nil => true

  attr_accessible :number_team_members, :duration_days, :start_on, :completed_at, :explicit_velocity

  before_validation :restrict_iteration_changes, :assign_iteration
  before_validation :restrict_changes_if_completed, :manage_completeness_amongst_other_sprints
  after_validation :check_date_overlaps_and_successive, :ensure_all_stories_are_accepted, :disallow_number_team_members_if_not_estimatable
  before_validation :stop_create_update_if_backlog_locked
  before_destroy :stop_destroy_if_backlog_locked, :ensure_sprint_allows_delete
  after_destroy :mark_snapshot_as_deleted_if_destroyed
  after_save :manage_sprint_snapshot

  scope :in_need_of_snapshot, includes([:backlog]).
    where('sprints.id not in (select snapshot_for_sprint_id from backlogs ' +
      'where snapshot_for_sprint_id IS NOT NULL and archived = ? and deleted = ?)', false, false).
    where('sprints.start_on < ?', Time.now)

  scope :completed, where('completed_at is not null')

  can_do :inherited_privilege => :backlog

  def end_on
    start_on + duration_days.days - 1
  end

  def mark_as_complete
    self.completed_at = Time.now
    save!
  end

  def mark_as_incomplete
    self.completed_at = nil
    save!
  end

  # editable if completed_at is not set, or completed_at has been changed but not yet saved
  def editable?
    completed_at.blank? || completed_at_changed?
  end

  def completed?
    !editable?
  end

  def deletable?
    if !editable?
      # not deletable if marked as completed
      return false
    else
      # deletable if no sprint exist with a higher iteration than this one
      return backlog.sprints.select { |s| s.iteration > self.iteration }.blank?
    end
  end

  def total_expected_points
    if explicit_velocity.present?
      explicit_velocity
    else
      backlog.velocity * number_team_members * duration_days
    end
  end

  def total_allocated_points
    ScoreCalculator.total_points cached_stories
  end

  def total_completed_points
    ScoreCalculator.total_points cached_stories.select { |s| s.accepted? }
  end

  # calculate total expected points based on the backlog average velocity as opposed to configured velocity
  def total_expected_based_on_average_points
    if (backlog.sprints.completed.present?)
      backlog.sprints.completed.inject(0) { |sum, sprint| sum + sprint.total_completed_points }.to_f / backlog.sprints.completed.count
    else
      total_expected_points
    end
  end

  def actual_velocity
    total_completed_points.to_f / number_team_members.to_f / duration_days.to_f if number_team_members.present?
  end

  # calculates completed on based on day before next sprint starting
  # or if not, calculates it based on working days
  def completed_on
    next_sprint = backlog.sprints.find_by_iteration(iteration + 1)
    if next_sprint
      completed_on_date = next_sprint.start_on - 1.days
      completed_on_date = completed_on_date - 1.day if completed_on_date.saturday?
      completed_on_date = completed_on_date - 2.days if completed_on_date.sunday?
      completed_on_date
    else
      # completed_date is simply start_on + duration of sprint + weekends
      assumed_completed_on
    end
  end

  # the assumed completed on date based on the start date and duration of this sprint
  def assumed_completed_on
    # complete on monday if weekend
    started = if start_on.saturday?
      start_on + 2.days
    elsif start_on.sunday?
      start_on + 1.day
    else
      start_on
    end

    # add weekends for every 5 working days that passes i.e. for 10 days, we need to add one weekend
    weekend_days = ((duration_days.to_i / 5) - 1) * 2
    weekend_days = 0 if weekend_days < 0

    completed_date = started + (duration_days + weekend_days).days

    completed_date = completed_date - 1.day # completed at date is day before next start date

    # if end on a weekend, move to the next working day
    completed_date = completed_date + 2.days if completed_date.saturday?
    completed_date = completed_date + 1.day if completed_date.sunday?

    completed_date
  end

  # snapshot is a non-editable copy of a backlog in time
  # we create one when a sprint is started so we can keep track of what the backlog looked like at that point
  def create_snapshot_if_missing
    if snapshot.blank?
      new_backlog = backlog.account.backlogs.new(backlog.safe_attributes.merge({ :name => "Sprint #{iteration}" }))
      new_backlog.prohibit_account_updates = true # ensure updates to account are not fired as this is a snapshot
      # these 2 attributes are protected
      new_backlog.author = backlog.author
      new_backlog.last_modified_user = backlog.last_modified_user
      new_backlog.save!

      # copy the children
      backlog.copy_children_to_backlog new_backlog

      # now lock the record and assign the snapshot master to self
      new_backlog.snapshot_for_sprint = self
      new_backlog.save!

      new_backlog
    else
      snapshot
    end
  end

  # method typically called when a backlog velocity is removed and we therefore need to retain the velocity set for each sprint
  def convert_to_explicit_velocity
    if explicit_velocity.blank?
      update_attribute :explicit_velocity, total_expected_points
      update_attribute :number_team_members, nil
    end
  end

  def team_velocity_estimatable?
    explicit_velocity.blank?
  end

  private
    # automatically assign a sequential iteration number
    def assign_iteration
      if iteration.blank?
        max = backlog.sprints.maximum('iteration')

        self.iteration = if (max.blank? || max == 0)
          1
        else
          max + 1
        end
      end
    end

    # do not allow any changes to the iteration number, this must be auto-assigned sequentially
    def restrict_iteration_changes
      if iteration_changed?
        errors.add :base, "Sprint iteration cannot be modified, this is automatically assigned"
        return false
      end
    end

    # ensure the date does not overlap with another iteration
    def check_date_overlaps_and_successive
      unless backlog.blank? || errors[:start_on].present? || errors[:duration_days].present?
        other_sprints = backlog.sprints.order('iteration').reject { |s| s.iteration == self.iteration }
        other_sprints.each do |sprint|
          date_range = sprint.start_on..sprint.end_on
          if (date_range === self.start_on) ||
              (date_range === self.end_on) ||
              (self.start_on < sprint.start_on && self.end_on > sprint.end_on)
            self.errors.add :base, "Start date and duration overlaps with sprint #{sprint.iteration}"
            return false
          end
          if (self.start_on < sprint.start_on) && (self.iteration > sprint.iteration)
            self.errors.add :base, "Start date is before sprint #{sprint.iteration}"
            return false
          end
        end
      end
    end

    # you cannot delete a sprint unless it's the last sprint of a backlog and it's not marked as complete
    def ensure_sprint_allows_delete
      if !editable?
        raise ActiveRecord::RecordNotSaved, "Can't delete a sprint that is completed"
      else
        unless backlog.blank?
          if (backlog.sprints.count > 0) && (backlog.sprints.order('iteration').last.iteration != iteration)
            raise ActiveRecord::RecordNotSaved, "Can't delete a sprint unless it's the most recent"
          end
        end
      end
    end

    # do not allow any changes once a sprint is completed, unless it's just been marked as complete
    def restrict_changes_if_completed
      if !editable?
        errors.add :base, "Can't modify a sprint if it is completed"
        return false
      end
    end

    # ensure stories are all marked as accepted if this sprint is marked as complete, you cannot mark a sprint as complete with incomplete stories
    def ensure_all_stories_are_accepted
      if completed_at_changed? && completed_at.present?
        if stories.reject { |s| s.sprint_story_status.present? && s.sprint_story_status.code == SprintStoryStatus::ACCEPTED }.count > 0
          errors.add :base, "Sprint cannot be marked as complete when it contains stories that are not accepted"
          return false
        end
      end
    end

    # do not allow stories to be added or removed to this sprint if this sprint is completed
    def check_editable_before_stories_changed(story)
      raise ActiveRecord::RecordNotSaved, 'Stories cannot be added/removed from this sprint as the sprint is complete' unless editable?
    end

    def manage_completeness_amongst_other_sprints
      if completed_at_changed?
        if completed_at.present? && iteration > 1
          # check that previous sprint is complete as this one has been marked as completed
          unless backlog.sprints.find_by_iteration(iteration-1).completed?
            errors.add :completed_at, "Sprint cannot be marked as complete unless sprint #{iteration-1} is marked as complete"
          end
        elsif completed_at.blank?
          # check that the successive sprint is not marked as completed as we can't mark this as incomplete and leave successive sprint as complete
          next_sprint_complete = backlog.sprints.find_by_iteration(iteration+1).completed? rescue false
          if next_sprint_complete
            errors.add :completed_at, "Sprint cannot be marked as incomplete unless sprint #{iteration+1} is marked as incomplete"
          end
        end
      end
    end

    # create a snapshot if this sprint is marked as complete, regardless of start date
    # remove snapshot if this sprint is not complete and start date is set in the future
    def manage_sprint_snapshot
      if completed_at.present?
        create_snapshot_if_missing
      elsif snapshot.present? && start_on.to_time > Time.now
        snapshot.delete
      end
    end

    # if a backlog does not have a velocity set
    # then don't allow the number of team members to be set
    def disallow_number_team_members_if_not_estimatable
      if number_team_members.present? && backlog.velocity.blank?
        errors.add :number_team_members, 'is not editable with this backlog'
      end
    end

    def stop_create_update_if_backlog_locked
      errors.add :base, 'Sprint cannot be created or modified as the backlog is not editable' if backlog.locked?
    end

    def stop_destroy_if_backlog_locked
      raise ActiveRecordExceptions::BacklogLocked.new('Sprint cannot be deleted as the backlog is not editable') if backlog.locked?
    end

    # snapshots are not actually deleted but simply marked as deleted so that they can be recevored if necessary, later they are cleaned up
    def mark_snapshot_as_deleted_if_destroyed
      snapshot.mark_deleted if snapshot.present?
    end

    # if stories are eager loaded, this is more performatn as sprint_stories are cached
    def cached_stories
      sprint_stories.map(&:story)
    end
end