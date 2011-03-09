# encoding: UTF-8

require 'spec_helper'

describe Story do
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
    backlog = Factory.create(:backlog, :rate => 800, :velocity => 3)
    theme = Factory.create(:theme, :backlog => backlog)
    story = Factory.create(:story, :theme => theme, :score_50 => 1, :score_90 => 2)
    story.points.should be_within(0.01).of(2)
    story.days.should be_within(0.01).of(0.67)
    story.cost.should be_within(0.4).of(533)
    story.cost_formatted.should eql('£533.33')
  end
end
