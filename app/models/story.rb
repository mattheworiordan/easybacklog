class Story < ActiveRecord::Base
  acts_as_list

  belongs_to :theme
  belongs_to :sprint
  has_many :acceptance_criteria, :dependent => :destroy, :order => 'position'
  belongs_to :sprint_status

  validates_presence_of :theme
  validates_uniqueness_of :unique_id, :scope => [:theme_id], :message => 'ID has already been taken'
  validates_numericality_of :score_50, :score_90, :allow_nil => true
  validates_numericality_of :unique_id, :greater_than => 0, :allow_nil => true, :message => 'ID must be a number greater than or equal to one'
  validates_format_of :score_50, :score_90, :with => /^(0|1|2|3|5|8|13|21)$/, :message => 'must be in the Fibonacci sequence and less than or equal to 21', :allow_nil => true
  validates_numericality_of :sprint_score_50_when_assigned, :sprint_score_90_when_assigned, :allow_nil => true
  validate :score_90_greater_than_50

  before_save :assign_unique_id
  before_save :check_can_modify # Snapshot method
  before_save :assign_sprint_scores_when_assigned
  before_validation :protect_sprint_scores_when_assigned, :prevent_changes_when_done, :prevent_assign_to_sprint_when_complete

  attr_accessible :unique_id, :as_a, :i_want_to, :so_i_can, :comments, :score_50, :score_90, :score, :position, :color

  include ScoreStatistics
  include Snapshot

  def editable?
    theme.backlog.editable?
  end

  def cost
    days * theme.backlog.rate
  end

  def cost_formatted
    (cost || 0).to_currency(:precision => 0, :locale => theme.backlog.account.locale.code.to_s)
  end

  def points
    Math.sqrt(score_diff) + lowest_score
  end

  def days
    points / theme.backlog.velocity
  end

  def days_formatted
    format('%0.1f', days)
  end

  def lowest_score
    (score_50 || score_90 || 0)
  end

  def score_diff
    if score_50.blank? || score_90.blank?
      0
    else
      (score_90 - score_50)
    end
  end

  # simply returns score 90 for cases when 50/90 rule is not used
  def score
    score_90
  end

  def score=(val)
    self.score_90 = val
    self.score_50 = val
  end

  # story is marked as done and assigned to a sprint
  def done?
    self.sprint.present? && self.sprint_status.present? && self.sprint_status.code == SprintStatus::DONE_CODE
  end

  private
    def score_90_greater_than_50
      unless score_50.blank? || score_90.blank?
        errors.add(:score_90, 'must be less than or equal to score 50') if score_90 < score_50
      end
    end

    def assign_unique_id
      unless theme.blank? # creation of this record will fail anyway as it needs a theme, no point
        if unique_id.blank?
          taken_ids = (if new_record?
            theme.stories
          else
            theme.stories.where('id <> ?', self.id)
          end).map(&:unique_id).sort

          self.unique_id = if taken_ids.empty?
            1
          else
            unique_id_gaps = (1..taken_ids.count).to_a - taken_ids
            if unique_id_gaps.empty?
               # all elements in sequence exist, go one higher than the highest element
              taken_ids.last + 1
            else
              # there is a gap, create a range of e.g. 1,2,3,4, remove taken ids and use first item left
              unique_id_gaps.first
            end
          end
        end
      end
    end

    # for reporting purposes, when a story is assigned to a sprint, store the scores at that time so we can report on change during a sprint
    def assign_sprint_scores_when_assigned
      if sprint_id_changed?
        self.sprint_score_50_when_assigned = score_50
        self.sprint_score_90_when_assigned = score_90
      end
    end

    # changes to scores stored for reporting purposes must only be changed by this model
    def protect_sprint_scores_when_assigned
      message = 'is not editable'
      errors.add :sprint_score_50_when_assigned, message if sprint_score_50_when_assigned_changed?
      errors.add :sprint_score_90_when_assigned, message if sprint_score_90_when_assigned_changed?
    end

    def prevent_changes_when_done
      errors.add :base, 'Changes to a completed story are not allowed' if done? && !sprint_status_id_changed?
    end

    def prevent_assign_to_sprint_when_complete
      if (sprint.present? && sprint.completed?) ||
        sprint_id_was.present? && Sprint.find(sprint_id_was).completed?
        errors.add :sprint_id, 'Cannot be assigned to or removed from a sprint that is completed'
      end
    end
end

