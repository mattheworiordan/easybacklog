# encoding: UTF-8

require 'spec_helper'

describe Story do
  # default sprint story status is needed when any story is assigned to a sprint
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }

  it 'should create a unique ID sequentially and fill up gaps' do
    # create 2 stories without IDs, so should be 1,2
    Factory.create(:theme, :name => "Theme A")
    story1_themeA = Factory.create(:story, :comments => 'Story 1', :theme => Theme.find_by_name('Theme A'))
    story2_themeA = Factory.create(:story, :comments => 'Story 2', :theme => Theme.find_by_name('Theme A'))
    story1_themeA.unique_id.should eql(1)
    story2_themeA.unique_id.should eql(2)

    # delete unique ID 2, then create a new story, should now be story => 1,story3 => 2
    story2_themeA.delete
    story3_themeA = Factory.create(:story, :comments => 'Story 3', :theme => Theme.find_by_name('Theme A')) # new story should take place of of deleted story
    story3_themeA.unique_id.should eql(2)

    # create story 4, should have id 3, then delete story1 (unique_id 1), create a new story5 which should take unique_id1
    story4_themeA = Factory.create(:story, :comments => 'Story 4', :theme => Theme.find_by_name('Theme A')) # new story should take place of of deleted story
    story1_themeA.delete
    story5_themeA = Factory.create(:story, :comments => 'Story 5', :theme => Theme.find_by_name('Theme A')) # new story should take place of of deleted story
    story4_themeA.unique_id.should eql(3)
    story5_themeA.unique_id.should eql(1)

    # change orders of unique_ids and make sure next story is higher, create in order 2,4,3,1
    new_story = Factory.create(:story, :comments => 'Story anonymous', :theme => Theme.find_by_name('Theme A'), :unique_id => 100)
    [ [story3_themeA, 2], [story4_themeA, 4], [story5_themeA, 3], [new_story, 1] ].each do |story, unique_id|
      story.unique_id = unique_id
      story.save!
    end
    Factory.create(:story, :theme => Theme.find_by_name('Theme A')).unique_id.should eql(5)
  end

  it 'should create a unique ID scoped to the theme' do
    Factory.create(:theme, :name => 'A')
    Factory.create(:theme, :name => 'B')

    story1_themeA = Factory.create(:story, :theme => Theme.find_by_name('A'))
    story2_themeA = Factory.create(:story, :theme => Theme.find_by_name('A'))

    story1_themeB = Factory.create(:story, :theme => Theme.find_by_name('B'))
    story2_themeB = Factory.create(:story, :theme => Theme.find_by_name('B'))

    story1_themeA.unique_id.should eql(1)
    story2_themeA.unique_id.should eql(2)
    story1_themeB.unique_id.should eql(1)
    story2_themeB.unique_id.should eql(2)
  end

  it 'should enforce Fibonacci sequence' do
    story = Factory.create(:story)
    story.should validate_format_of(:score_50).with('1').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).with('21').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).not_with('12').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).not_with('34').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).not_with('aa').with_message(/is not a number/)
    story.should validate_format_of(:score_50).with('').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
  end

  it 'should ensure score 50 is greater than score 90' do
    story = Factory.create(:story)
    story.score_50 = 13
    story.score_90 = 1
    story.should have(1).error_on(:score_90)
    story.score_50 = 1
    story.should have(0).errors_on(:score_90)
  end

  it 'should ensure days and costs are accurate' do
    story = Factory.create(:story, :score_50 => 1, :score_90 => 2)

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
    story = Factory.create(:story, :score_50 => 1, :score_90 => 2)

    story.score.should == 2

    story.score = 3
    story.score_50.should == 3
    story.score_90.should == 3
  end

  it 'should not allow modification once marked as done' do
    done = Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE)
    story = Factory.create(:story, :score_50 => 1)
    sprint = Factory.create(:sprint, :backlog_id => story.theme.backlog.id)
    sprint.stories << story

    story.sprint_story_status = done
    story.save!
    story.reload

    story.score_50 = 2
    expect { story.save! }.should raise_error ActiveRecord::RecordInvalid, /Changes to a completed story are not allowed/
  end

  it 'should not allow to be assigned or removed from a sprint when the sprint is marked as complete' do
    done = Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE)
    story = Factory.create(:story)
    sprint = Factory.create(:sprint, :backlog_id => story.theme.backlog.id, :completed_at => Time.now)
    sprint.completed?.should == true

    expect { sprint.stories << story }.should raise_error ActiveRecord::RecordNotSaved, /Stories cannot be added\/removed from this sprint as the sprint is complete/

    sprint.mark_as_incomplete
    story.reload
    expect { sprint.stories << story }.should_not raise_error

    story.sprint_story_status = done
    sprint.reload
    sprint.mark_as_complete
    story.reload
    expect { sprint.stories.destroy(story) }.should raise_error ActiveRecord::RecordNotSaved, /Stories cannot be added\/removed from this sprint as the sprint is complete/

    sprint.mark_as_incomplete
    story.reload
    expect { sprint.stories.destroy(story) }.should_not raise_error
  end
end
