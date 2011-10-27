# encoding: UTF-8

require 'spec_helper'

describe SprintStory do
  # default sprint story status is needed when any story is assigned to a sprint
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE) }

  before(:each) do
    @story = Factory.create(:story, :score_50 => 1, :score_90 => 2)
    @sprint = Factory.create(:sprint, :backlog => @story.theme.backlog)
    @sprint.stories << @story
  end

  it 'should assign the sprint scoring fields automatically when assigned to a sprint' do
    @story.sprint_story.sprint_score_50_when_assigned.should == 1
    @story.sprint_story.sprint_score_90_when_assigned.should == 2
  end

  it 'should not allow the sprint scoring fields to be modified directly' do
    @story.sprint_story.sprint_score_50_when_assigned = 2
    @story.sprint_story.sprint_score_90_when_assigned = 3
    expect { @story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /Sprint score 50 when assigned is not editable/
    expect { @story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /Sprint score 90 when assigned is not editable/
  end

  it 'should not be allowed to be reassigned to from a complete sprint or to a complete sprint' do
    sprint2 = Factory.create(:sprint, :backlog_id => @story.theme.backlog.id, :completed_at => Time.now)

    # cannot assign to sprint2 as it is complete
    @story.sprint_story.sprint = sprint2
    expect { @story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /cannot be assigned to a complete sprint or removed from a sprint that is completed/

    sprint2.mark_as_incomplete
    @story.sprint_story.update_attributes :sprint_story_status_id => done_sprint_story_status.id # must mark as done to assign so that @sprint can be marked as completed
    @story.sprint_story.sprint = @sprint
    @story.sprint_story.save!
    @sprint.reload
    @sprint.mark_as_complete

    # cannot assign to sprint2 as sprint (current assignment) is complete
    @story.reload
    @story.sprint_story.sprint = sprint2
    expect { @story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /cannot be assigned to a complete sprint or removed from a sprint that is completed/

    # now mark @sprint as complete and just assign to sprint 2, it should work
    @sprint.mark_as_incomplete
    @story.reload
    @story.sprint_story.sprint = sprint2
    expect { @story.sprint_story.save! }.should_not raise_error
  end

  it 'should be allocated a sprint story status whenever it is added to a sprint' do
    @story.sprint_story.sprint_story_status.should == default_sprint_story_status
  end

  it 'should not allow a done story to be deleted (unassigned) from a sprint' do
    @story.sprint_story.update_attributes :sprint_story_status_id => done_sprint_story_status.id
    @story.reload
    expect { @story.sprint_story.destroy }.should raise_error SprintStory::RecordNotDestroyable
  end

  it 'should not allow a sprint story to be deleted from a complete sprint' do
    @story.sprint_story.update_attributes :sprint_story_status_id => done_sprint_story_status.id
    @sprint.reload
    @sprint.mark_as_complete
    # try deleting the sprint story 3 ways, admittedly probably unnecessary, but this is a test after all and it's good to make sure
    expect { @story.sprint_story.destroy }.should raise_error SprintStory::RecordNotDestroyable
    expect { @sprint.sprint_stories.destroy @story.sprint_story }.should raise_error SprintStory::RecordNotDestroyable
    expect { @sprint.stories.destroy @story }.should raise_error ActiveRecord::RecordNotSaved
  end
end