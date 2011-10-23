class Story < ActiveRecord::Base
  acts_as_list :scope => :theme

  belongs_to :theme
  has_one :sprint, :through => :sprint_story
  has_one :sprint_story, :dependent => :destroy
  has_many :acceptance_criteria, :dependent => :destroy, :order => 'position'

  validates_presence_of :theme
  validates_uniqueness_of :unique_id, :scope => [:theme_id], :message => 'ID has already been taken'
  validates_numericality_of :score_50, :score_90, :allow_nil => true
  validates_numericality_of :unique_id, :greater_than => 0, :allow_nil => true, :message => 'ID must be a number greater than or equal to one'
  validates_format_of :score_50, :score_90, :with => /^(0|1|2|3|5|8|13|21)$/, :message => 'must be in the Fibonacci sequence and less than or equal to 21', :allow_nil => true
  validate :score_90_greater_than_50

  before_save :assign_unique_id
  before_save :check_can_modify # Snapshot method
  before_validation :prevent_changes_when_done

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
    self.sprint.present? && self.sprint_story_status.present? && self.sprint_story_status.code == SprintStoryStatus::DONE_CODE
  end

  def sprint_story_status=(status)
    if (self.sprint_story.present?)
      self.sprint_story.sprint_story_status = status
      self.sprint_story.save!
    else
      raise 'Story is not assigned to a sprint'
    end
  end

  def sprint_story_status
    self.sprint_story.present? && self.sprint_story.sprint_story_status
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

    def prevent_changes_when_done
      errors.add :base, 'Changes to a completed story are not allowed' if done?
    end
end

