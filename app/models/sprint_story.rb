class SprintStory < ActiveRecord::Base
  acts_as_list :scope => :sprint
  belongs_to :sprint
  belongs_to :story
  belongs_to :sprint_story_status

  validates_presence_of :story_id, :sprint_id
  validates_uniqueness_of :story_id, :scope => :sprint_id
  validates_numericality_of :sprint_score_50_when_assigned, :sprint_score_90_when_assigned, :allow_nil => true

  before_save :assign_sprint_scores_when_assigned
  before_validation :protect_sprint_scores_when_assigned, :prevent_assign_to_sprint_when_complete

  attr_accessible :position, :sprint_story_status_id, :sprint_id, :story_id

  def theme_id
    if story.present?
      story.theme_id
    end
  end

  private
    def prevent_assign_to_sprint_when_complete
      if sprint_id_changed? && (sprint.completed? || (sprint_id_was.present? && Sprint.find(sprint_id_was).completed?) )
        errors.add :sprint_id, 'cannot be assigned to a complete sprint or removed from a sprint that is completed'
      end
    end


    # for reporting purposes, when a story is assigned to a sprint, store the scores at that time so we can report on change during a sprint
    def assign_sprint_scores_when_assigned
      if sprint_id_changed?
        self.sprint_score_50_when_assigned = story.score_50
        self.sprint_score_90_when_assigned = story.score_90
      end
    end

    # changes to scores stored for reporting purposes must only be changed by this model
    def protect_sprint_scores_when_assigned
      message = 'is not editable'
      errors.add :sprint_score_50_when_assigned, message if sprint_score_50_when_assigned_changed?
      errors.add :sprint_score_90_when_assigned, message if sprint_score_90_when_assigned_changed?
    end
end