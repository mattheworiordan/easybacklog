# encoding: UTF-8

require 'spec_helper'

describe SprintStory do
  it 'should assign the sprint scoring fields automatically when assigned to a sprint' do
    story = Factory.create(:story, :score_50 => 1, :score_90 => 2)
    sprint = Factory.create(:sprint, :backlog_id => story.theme.backlog.id)
    sprint.stories << story
    story.sprint_story.sprint_score_50_when_assigned.should == 1
    story.sprint_story.sprint_score_90_when_assigned.should == 2
  end

  it 'should not allow the sprint scoring fields to be modified directly' do
    story = Factory.create(:story, :score_50 => 1, :score_90 => 2)
    sprint = Factory.create(:sprint, :backlog_id => story.theme.backlog.id)
    sprint.stories << story
    story.sprint_story.sprint_score_50_when_assigned = 2
    story.sprint_story.sprint_score_90_when_assigned = 3
    expect { story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /Sprint score 50 when assigned is not editable/
    expect { story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /Sprint score 90 when assigned is not editable/
  end

  it 'should not be allowed to be reassigned to from a complete sprint or to a complete sprint' do
    done = Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE)
    story = Factory.create(:story)
    sprint1 = Factory.create(:sprint, :backlog_id => story.theme.backlog.id)
    sprint2 = Factory.create(:sprint, :backlog_id => story.theme.backlog.id, :completed_at => Time.now)

    sprint1.stories << story

    # cannot assign to sprint2 as it is complete
    story.sprint_story.sprint_id = sprint2.id
    expect { story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /cannot be assigned to a complete sprint or removed from a sprint that is completed/

    sprint2.mark_as_incomplete
    story.reload
    story.sprint_story_status = done
    sprint1.mark_as_complete

    # cannot assign to sprint2 as sprint1 (current assignment) is complete
    story.reload
    story.sprint_story_status = nil
    story.sprint_story.sprint_id = sprint2.id
    expect { story.sprint_story.save! }.should raise_error ActiveRecord::RecordInvalid, /cannot be assigned to a complete sprint or removed from a sprint that is completed/

    sprint1.mark_as_incomplete
    story.reload
    story.sprint_story.sprint_id = sprint2.id
    expect { story.sprint_story.save! }.should_not raise_error
  end
end