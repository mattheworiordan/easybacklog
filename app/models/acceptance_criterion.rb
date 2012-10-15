class AcceptanceCriterion < ActiveRecord::Base
  include Lockable
  include ActiveRecordExceptions

  acts_as_list :scope => :story

  belongs_to :story, :inverse_of => :acceptance_criteria

  before_validation :check_story_editable
  before_destroy :prevent_delete_if_story_not_editable
  attr_accessible :criterion, :position

  can_do :inherited_privilege => :story

  def editable?
    backlog.editable?
  end

  def destroyable?
    editable? || backlog.destroyable?
  end

  def backlog
    theme.backlog
  end

  def theme
    story.theme
  end

  def index_to_letters(index)
    ((index % 26) + 97).chr + (index < 26 ? '' : (index.to_f / 26.0).floor).to_s
  end

  private
    def check_story_editable
      errors.add :base, 'Cannot edit as story is marked as accepted and therefore locked' if story.accepted?
    end

    def prevent_delete_if_story_not_editable
      raise AcceptanceCriterion::RecordLocked, 'Cannot delete as story is marked as accepted and therefore locked' if story.accepted?
    end
end