class Sprint < ActiveRecord::Base
  belongs_to :backlog
  has_one :snapshot, :class_name => 'Backlog', :conditions => ['deleted <> ?', true], :dependent => :destroy, :foreign_key => 'snapshot_for_sprint_id'
  has_many :stories, :before_add => :check_editable_before_stories_changed, :before_remove => :check_editable_before_stories_changed
  has_one :sprint_status

  validates_uniqueness_of :iteration, :scope => [:backlog_id], :message => 'has already been taken for another sprint'
  validates_presence_of :iteration, :start_on, :number_team_members, :duration_days
  validates_numericality_of :number_team_members, :duration_days, :iteration, :greater_than => 0, :message => 'must be a number greater than or equal to one'

  attr_accessible :number_team_members, :duration_days, :start_on, :completed_at

  before_validation :restrict_iteration_changes, :assign_iteration, :check_date_overlaps_and_successive, :restrict_changes_if_completed, :ensure_all_stories_are_done
  before_destroy :ensure_sprint_allows_delete

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
      return backlog.sprints.where('iteration > ?', [iteration]).blank?
    end
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
      unless backlog.blank?
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

    # ensure stories are all marked as done if this sprint is marked as complete, you cannot mark a sprint as complete with incomplete stories
    def ensure_all_stories_are_done
      if completed_at_changed? && completed_at.present?
        if stories.reject { |s| s.sprint_status.present? && s.sprint_status.code == SprintStatus::DONE_CODE }.count > 0
          errors.add :base, "Sprint cannot be marked as complete when it contains stories that are not done"
          return false
        end
      end
    end

    # do not allow stories to be added or removed to this sprint if this sprint is completed
    def check_editable_before_stories_changed(story)
      raise ActiveRecord::RecordNotSaved, 'Stories cannot be added/removed from this sprint as the sprint is complete' unless editable?
    end
end