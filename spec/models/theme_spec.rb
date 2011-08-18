# encoding: UTF-8

require 'spec_helper'

describe Theme do
  it 'should create a unique code based on the name' do
    # take 1st of letter of each word
    Factory.create(:theme, :name => 'Use first three').code.should eql('UFT')

    # take 1st 2 letters from 1st word, 2nd letter from 2nd word
    Factory.create(:theme, :name => '12 Examples').code.should eql('12E')

    # take 1st 3 letters from 1st word
    Factory.create(:theme, :name => 'Visitors').code.should eql('VIS')
    
    # ignore punctuation and treat as words
    Factory.create(:theme, :name => 'Here-is////A').code.should eql('HIA')

    # take 1st letter from 1st word, 2nd two letters from 2nd word
    theme = Factory.create(:theme, :name => 'T Example')
    theme.code.should eql('TEX')

    backlog = theme.backlog

    # some combination as above, so use unique 2nd letter in order 1-9, then 10-99, then 100-999
    Factory.create(:theme, :name => 'T Example2', :backlog => backlog).code.should eql('TE1')

    # fill up slots up to 24, next available should be T25
    (2..9).each do |index|
      Factory.create(:theme, :name => "T Example #{index}", :backlog => backlog, :code => "TE#{index}")
    end
    (10..24).each do |index|
      Factory.create(:theme, :name => "T Example #{index}", :backlog => backlog, :code => "T#{index}")
    end
    Factory.create(:theme, :name => 'T Example 25', :backlog => backlog).code.should eql('T25')
  end

  it 'should enforce a 3 letter code for the Theme code' do
    theme = Factory.create(:theme)
    theme.should validate_format_of(:code).not_with('1A').with_message(/must be 3 alphanumeric characters/)
    theme.should validate_format_of(:code).not_with('1ACD').with_message(/must be 3 alphanumeric characters/)
    theme.should allow_value('123').for(:code)
    theme.should allow_value('AbC').for(:code)
  end

  it 'should ensure days and costs are accurate based on the stories' do
    backlog = Factory.create(:backlog, :rate => 800, :velocity => 3)
    theme = Factory.create(:theme, :backlog => backlog)
    story = Factory.create(:story, :theme => theme, :score_50 => 5, :score_90 => 8)
    Factory.create(:story, :theme => theme, :score_50 => 1, :score_90 => 2)
    Factory.create(:story, :theme => theme, :score_50 => 3, :score_90 => 3)
    theme.points.should be_within(0.01).of(12.16)
    theme.days.should be_within(0.1).of(4.05)
    theme.cost.should be_within(1).of(3243)
    theme.cost_formatted.should eql('£3,243')
  end

  it 'should be able to renumber stories' do
    theme = Factory.create(:theme)
    story1 = Factory.create(:story, :theme => theme)
    story2 = Factory.create(:story, :theme => theme)
    story3 = Factory.create(:story, :theme => theme)
    story3.move_to_top
    # shifted story 3 to the top, so order should now be 3, 1, 2
    theme.reload
    theme.re_number_stories
    story1.reload.unique_id.should eql(2)
    story2.reload.unique_id.should eql(3)
    story3.reload.unique_id.should eql(1)
  end
end
