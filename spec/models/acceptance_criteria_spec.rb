# encoding: UTF-8

require 'spec_helper'

describe AcceptanceCriterion do
  # default sprint story status is needed when any story is assigned to a sprint
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE) }
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  before(:each) do
    @criterion = Factory.create(:acceptance_criterion)
    @story = @criterion.story
    @sprint = Factory.create(:sprint, :backlog => @criterion.story.theme.backlog)
    @sprint.stories << @story
  end

  it 'should not allow changes to acceptance criterion when a story is done' do
    @story.sprint_story.sprint_story_status = done_sprint_story_status;
    @story.sprint_story.save!

    @criterion.reload
    @criterion.criterion = 'new criterion'
    expect { @criterion.save! }.should raise_error ActiveRecord::RecordInvalid, /Cannot edit as story is marked as done and therefore locked/

    @criterion.reload
    @criterion.position = 5
    expect { @criterion.save! }.should raise_error ActiveRecord::RecordInvalid, /Cannot edit as story is marked as done and therefore locked/

    expect { @criterion.destroy }.should raise_error AcceptanceCriterion::RecordLocked, /Cannot delete as story is marked as done and therefore locked/
  end

  it 'method index_to_letters should covert an index starting from zero into letters' do
    @criterion.index_to_letters(0).should == 'a'
    @criterion.index_to_letters(25).should == 'z'
    @criterion.index_to_letters(26).should == 'a1'
    @criterion.index_to_letters(51).should == 'z1'
    @criterion.index_to_letters(52).should == 'a2'
  end
end