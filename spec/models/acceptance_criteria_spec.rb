# encoding: UTF-8

require 'spec_helper'

describe AcceptanceCriterion do
  # default sprint story status is needed when any story is assigned to a sprint
  let!(:default_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:accepted_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }

  before(:each) do
    @criterion = FactoryGirl.create(:acceptance_criterion)
    @story = @criterion.story
    @sprint = FactoryGirl.create(:sprint, :backlog => @criterion.story.theme.backlog)
    @sprint.stories << @story
  end

  it 'should not allow changes to acceptance criterion when a story is accepted' do
    @story.sprint_story.sprint_story_status = accepted_sprint_story_status;
    @story.sprint_story.save!

    @criterion.reload
    @criterion.criterion = 'new criterion'
    expect { @criterion.save! }.should raise_error ActiveRecord::RecordInvalid, /Cannot edit as story is marked as accepted and therefore locked/

    @criterion.reload
    @criterion.position = 5
    expect { @criterion.save! }.should raise_error ActiveRecord::RecordInvalid, /Cannot edit as story is marked as accepted and therefore locked/

    expect { @criterion.destroy }.should raise_error AcceptanceCriterion::RecordLocked, /Cannot delete as story is marked as accepted and therefore locked/
  end

  it 'method index_to_letters should convert an index starting from zero into letters' do
    @criterion.index_to_letters(0).should == 'a'
    @criterion.index_to_letters(25).should == 'z'
    @criterion.index_to_letters(26).should == 'a1'
    @criterion.index_to_letters(51).should == 'z1'
    @criterion.index_to_letters(52).should == 'a2'
  end

  # rather silly test as we're just testing the functionality of acts_as_list, however an issue occurred where acts_as_list stopped working so this is an extra check
  it 'should allow order to be changed' do
    c1 = FactoryGirl.create(:acceptance_criterion, :criterion => 'Position 1')
    story = c1.story
    c2 = FactoryGirl.create(:acceptance_criterion, :criterion => 'Position 2', :story => story)
    c3 = FactoryGirl.create(:acceptance_criterion, :criterion => 'Position 3', :story => story)

    story.acceptance_criteria.length.should == 3
    story.acceptance_criteria.first.should == c1
    story.acceptance_criteria.last.should == c3

    c3.move_to_top
    story.acceptance_criteria.reload
    story.acceptance_criteria.first.should == c3
    story.acceptance_criteria.last.should == c2

    c1.move_to_bottom
    story.acceptance_criteria.reload
    story.acceptance_criteria.first.should == c3
    story.acceptance_criteria.last.should == c1
  end
end