# encoding: UTF-8

require 'spec_helper'

describe Story do
  # default sprint story status is needed when any story is assigned to a sprint
  let!(:default_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }

  it 'should create a unique ID sequentially and fill up gaps' do
    # create 2 stories without IDs, so should be 1,2
    FactoryGirl.create(:theme, :name => "Theme A")
    story1_themeA = FactoryGirl.create(:story, :comments => 'Story 1', :theme => Theme.find_by_name('Theme A'))
    story2_themeA = FactoryGirl.create(:story, :comments => 'Story 2', :theme => Theme.find_by_name('Theme A'))
    story1_themeA.unique_id.should eql(1)
    story2_themeA.unique_id.should eql(2)

    # delete unique ID 2, then create a new story, should now be story => 1,story3 => 2
    story2_themeA.delete
    story3_themeA = FactoryGirl.create(:story, :comments => 'Story 3', :theme => Theme.find_by_name('Theme A')) # new story should take place of of deleted story
    story3_themeA.unique_id.should eql(2)

    # create story 4, should have id 3, then delete story1 (unique_id 1), create a new story5 which should take unique_id1
    story4_themeA = FactoryGirl.create(:story, :comments => 'Story 4', :theme => Theme.find_by_name('Theme A')) # new story should take place of of deleted story
    story1_themeA.delete
    story5_themeA = FactoryGirl.create(:story, :comments => 'Story 5', :theme => Theme.find_by_name('Theme A')) # new story should take place of of deleted story
    story4_themeA.unique_id.should eql(3)
    story5_themeA.unique_id.should eql(1)

    # change orders of unique_ids and make sure next story is higher, create in order 2,4,3,1
    new_story = FactoryGirl.create(:story, :comments => 'Story anonymous', :theme => Theme.find_by_name('Theme A'), :unique_id => 100)
    [ [story3_themeA, 2], [story4_themeA, 4], [story5_themeA, 3], [new_story, 1] ].each do |story, unique_id|
      story.unique_id = unique_id
      story.save!
    end
    FactoryGirl.create(:story, :theme => Theme.find_by_name('Theme A')).unique_id.should eql(5)
  end

  it 'should create a unique ID scoped to the theme' do
    FactoryGirl.create(:theme, :name => 'A')
    FactoryGirl.create(:theme, :name => 'B')

    story1_themeA = FactoryGirl.create(:story, :theme => Theme.find_by_name('A'))
    story2_themeA = FactoryGirl.create(:story, :theme => Theme.find_by_name('A'))

    story1_themeB = FactoryGirl.create(:story, :theme => Theme.find_by_name('B'))
    story2_themeB = FactoryGirl.create(:story, :theme => Theme.find_by_name('B'))

    story1_themeA.unique_id.should eql(1)
    story2_themeA.unique_id.should eql(2)
    story1_themeB.unique_id.should eql(1)
    story2_themeB.unique_id.should eql(2)
  end

  it 'should enforce Modified Fibonacci sequence' do
    # uses modified fibonacci by default
    story = FactoryGirl.create(:story)
    story.should validate_format_of(:score_50).with('0.5').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).with('1').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).with('21').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).with('40').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).with('100').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).not_with('12').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).not_with('34').with_message(/is not valid according to the modified Fibonacci sequence/)
    story.should validate_format_of(:score_50).not_with('aa').with_message(/is not a number/)
    story.should validate_format_of(:score_50).with('').with_message(/is not a valid number/) # allow null
  end

  it 'should enforce Strict Fibonacci sequence' do
    backlog = FactoryGirl.create(:backlog, :scoring_rule_id => FactoryGirl.create(:scoring_rule_fib).id)
    theme = FactoryGirl.create(:theme, :backlog => backlog)
    story = FactoryGirl.create(:story, :theme => theme)

    story.should validate_format_of(:score_90).with('21').with_message(/is not valid according to the Fibonacci sequence/)
    story.should validate_format_of(:score_90).with('13').with_message(/is not valid according to the Fibonacci sequence/)
    story.should validate_format_of(:score_90).not_with('40').with_message(/is not valid according to the Fibonacci sequence/)
    story.should validate_format_of(:score_90).not_with('100').with_message(/is not valid according to the Fibonacci sequence/)
    story.should validate_format_of(:score_90).not_with('12').with_message(/is not valid according to the Fibonacci sequence/)
    story.should validate_format_of(:score_90).not_with('35').with_message(/is not valid according to the Fibonacci sequence/)
  end

  it 'should enforce any number sequence' do
    backlog = FactoryGirl.create(:backlog, :scoring_rule_id => FactoryGirl.create(:scoring_rule_any).id)
    theme = FactoryGirl.create(:theme, :backlog => backlog)
    story = FactoryGirl.create(:story, :theme => theme)

    story.should validate_format_of(:score_50).with('21').with_message(/needs to be greater than or equal to zero/)
    story.should validate_format_of(:score_50).with('13.34').with_message(/needs to be greater than or equal to zero/)
    story.should validate_format_of(:score_50).with('0').with_message(/needs to be greater than or equal to zero/)
    story.should validate_format_of(:score_50).not_with('-0.5').with_message(/needs to be greater than or equal to zero/)
    story.should validate_format_of(:score_50).not_with('-10').with_message(/needs to be greater than or equal to zero/)
    story.should validate_format_of(:score_50).not_with('bb').with_message(/is not a number/)
    story.should validate_format_of(:score_50).with('').with_message(/is not a number/) # allow null
  end

  context 'score 50/90 validation' do
    let(:story) { FactoryGirl.create(:story) }

    it 'should ensure score 50 is greater than score 90' do
      story.score_50 = 13
      story.score_90 = 1
      story.should have(1).error_on(:score_90)
      story.score_50 = 1
      story.should have(0).errors_on(:score_90)
    end

    it 'should ensure score 50 is greater than score 90 when score 90 changed' do
      story.score_50 = 8
      story.save!
      story.score_90 = 3
      story.should have(1).errors_on(:score_90)
      story.errors[:score_90].should be_any { |m| m =~ /must be greater than or equal to score 50/ }
    end

    it 'should ensure score 50 is greater than score 90 when score 90 changed' do
      story.score_90 = 5
      story.save!
      story.score_50 = 8
      story.should have(1).errors_on(:score_50)
      story.errors[:score_50].should be_any { |m| m =~ /must be less than or equal to score 90/ }
    end
  end

  it 'should ensure days and costs are accurate' do
    story = FactoryGirl.create(:story, :score_50 => 1, :score_90 => 2)

    story.points.should be_within(0.01).of(2)
    story.days.should be_within(0.01).of(0.67)
    story.days_formatted.should eql('0.7')
    story.cost.should be_within(0.4).of(533)
    story.cost_formatted.should eql('£533')

    story.score_statistics.should eql({
      :points => story.points,
      :cost_formatted => story.cost_formatted,
      :days => story.days,
      :themes => [{
        :theme_id => story.theme.id,
        :points => story.theme.points,
        :cost_formatted => story.theme.cost_formatted,
        :days => story.theme.days
      }]
    })
  end

  it 'should allow score to be used interchangeably with score 50/90' do
    story = FactoryGirl.create(:story, :score_50 => 1, :score_90 => 2)

    story.score.should == 2

    story.score = 3
    story.score_50.should == 3
    story.score_90.should == 3
  end

  it 'should not allow modification other than position once marked as accepted' do
    accepted = FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED)
    story = FactoryGirl.create(:story, :score_50 => 1)
    sprint = FactoryGirl.create(:sprint, :backlog_id => story.theme.backlog.id)
    sprint.stories << story

    story.sprint_story_status = accepted
    story.save!
    story.reload

    story.score_50 = 2
    expect { story.save! }.to raise_error ActiveRecord::RecordInvalid, /Changes to a completed story are not allowed/

    story.reload
    story.position = 2
    expect { story.save! }.to_not raise_error
  end

  it 'should not allow to be assigned or removed from a sprint when the sprint is marked as complete' do
    accepted = FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED)
    story = FactoryGirl.create(:story)
    sprint = FactoryGirl.create(:sprint, :backlog_id => story.theme.backlog.id, :completed_at => Time.now)
    sprint.completed?.should == true

    expect { sprint.stories << story }.to raise_error ActiveRecord::RecordNotSaved, /Stories cannot be added\/removed from this sprint as the sprint is complete/

    sprint.mark_as_incomplete
    story.reload
    expect { sprint.stories << story }.to_not raise_error

    story.sprint_story_status = accepted
    sprint.reload
    sprint.mark_as_complete
    story.reload
    expect { sprint.stories.destroy(story) }.to raise_error ActiveRecord::RecordNotSaved, /Stories cannot be added\/removed from this sprint as the sprint is complete/

    sprint.mark_as_incomplete
    story.sprint_story_status = default_sprint_story_status
    story.save!
    expect { sprint.stories.destroy(story) }.to_not raise_error
  end

  context 'moving to another theme' do
    before(:each) do
      @theme1 = FactoryGirl.create(:theme)
      @theme2 = FactoryGirl.create(:theme, :backlog => @theme1.backlog)
    end
    subject { FactoryGirl.create(:story, :theme => @theme2) }

    it 'should allow a story to be moved to another theme with existing stories' do
      FactoryGirl.create(:story, :theme => @theme1)
      FactoryGirl.create(:story, :theme => @theme1)
      subject.move_to_theme @theme1
      [@theme1, @theme2].each(&:reload)
      @theme1.stories.count.should == 3
      @theme1.stories.last.should == subject
      @theme2.stories.should be_empty
    end

    it 'should allow a story to be moved to an empty theme' do
      subject.move_to_theme @theme1
      [@theme1, @theme2].each(&:reload)
      @theme1.stories.count.should == 1
      @theme1.stories.first.should == subject
      @theme2.stories.should be_empty
    end
  end
end
