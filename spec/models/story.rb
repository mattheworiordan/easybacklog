require 'spec_helper'

describe Story do
  it 'should create a unique ID sequentially and fill up gaps' do
    story1_themeA = Factory.create(:story)
    theme_A = story1_themeA.theme
    story2_themeA = Factory.create(:story, :theme => theme_A)

    story1_themeA.unique_id.should eql(1)
    story2_themeA.unique_id.should eql(2)

    story2_themeA.delete
    story3_themeA = Factory.create(:story, :theme => theme_A) # new story should take place of of deleted story
    story3_themeA.unique_id.should eql(2)

    story4_themeA = Factory.create(:story, :theme => theme_A) # new story should take place of of deleted story
    story1_themeA.delete
    story5_themeA = Factory.create(:story, :theme => theme_A) # new story should take place of of deleted story
    story4_themeA.unique_id.should eql(3)
    story5_themeA.unique_id.should eql(1)
  end

  it 'should create a unique ID unique only to the theme' do
    story1_themeA = Factory.create(:story)
    theme_A = story1_themeA.theme
    story2_themeA = Factory.create(:story, :theme => theme_A)

    story1_themeB = Factory.create(:story)
    theme_B = story1_themeB.theme
    story2_themeB = Factory.create(:story, :theme => theme_B)

    story1_themeA.unique_id.should eql(1)
    story2_themeA.unique_id.should eql(2)
    story1_themeB.unique_id.should eql(1)
    story2_themeB.unique_id.should eql(2)
  end

  it 'should enforoce Fibonacci sequence' do
    story = Factory.create(:story)
    story.should validate_format_of(:score_50).with('1').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).with('21').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).not_with('12').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).not_with('34').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
    story.should validate_format_of(:score_50).not_with('aa').with_message(/is not a number/)
    story.should validate_format_of(:score_50).with('').with_message(/must be in the Fibonacci sequence and less than or equal to 21/)
  end
end
