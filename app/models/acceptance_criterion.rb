class AcceptanceCriterion < ActiveRecord::Base
  acts_as_list :scope => :story

  belongs_to :story

  before_validation :check_story_editable
  before_destroy :prevent_delete_if_story_not_editable
  attr_accessible :criterion, :position

  include Snapshot
  include ActiveRecordExceptions

  def editable?
    story.theme.backlog.editable?
  end

  private
    def check_story_editable
      errors.add :base, 'Cannot edit as story is marked as done and therefore locked' if story.done?
    end

    def prevent_delete_if_story_not_editable
      raise AcceptanceCriterion::RecordLocked, 'Cannot delete as story is marked as done and therefore locked' if story.done?
    end
end