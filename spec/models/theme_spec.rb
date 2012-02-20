# encoding: UTF-8

require 'spec_helper'

describe Theme do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }

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

  it 'should not allow stories to be renumbered when one or more stories are DONE' do
    status_done = Factory.create(:sprint_story_status_done)
    theme = Factory.create(:theme)
    story1 = Factory.create(:story, :theme => theme)
    story2 = Factory.create(:story, :theme => theme)

    sprint = Factory.create(:sprint, :backlog => theme.backlog)
    sprint.sprint_stories.create! :story_id => story1.id, :sprint_story_status_id => SprintStoryStatus.done.id

    theme.reload
    expect { theme.re_number_stories }.to raise_error Theme::StoriesCannotBeRenumbered
  end


  # Hoptoad/Airbrake error https://herokuapp439683herokucom.hoptoadapp.com/errors/4865945
  it 'should create a new theme with edge case theme name "Safe hands user tests"' do
    theme = Factory.create(:theme, :name => 'Safe hands users tests')
    theme.code.should == 'SHU'
    theme.name.should == 'Safe hands users tests'
  end

  describe '#add_existing_story' do
    it 'should allow stories from an existing theme to be moved to this theme' do
      story_theme1 = Factory.create(:story)
      theme1 = story_theme1.theme
      theme2 = Factory.create(:theme, :backlog => theme1.backlog)
      story_theme2 = Factory.create(:story, :theme => theme2)

      story_theme1.unique_id.should == 1
      story_theme2.unique_id.should == 1
      theme1.add_existing_story story_theme2
      story_theme2.reload
      story_theme2.theme.should == theme1
      story_theme2.unique_id.should == 2
    end

    it 'should allow stories from an existing theme to be moved to this theme and keep the unique ID if available' do
      story_theme1 = Factory.create(:story)
      theme1 = story_theme1.theme
      theme2 = Factory.create(:theme, :backlog => theme1.backlog)
      story1_theme2 = Factory.create(:story, :theme => theme2)
      story2_theme2 = Factory.create(:story, :theme => theme2, :unique_id => 4)

      story_theme1.unique_id.should == 1
      story1_theme2.unique_id.should == 1
      story2_theme2.unique_id.should == 4
      theme1.add_existing_story story2_theme2
      story2_theme2.reload
      story2_theme2.theme.should == theme1
      story2_theme2.unique_id.should == 4
    end

    it 'should not allow stories from another backlog to be moved to this theme' do
      story_theme1 = Factory.create(:story)
      story_theme2 = Factory.create(:story)

      expect { story_theme1.theme.add_existing_story story_theme2 }.to raise_error Theme::StoryCannotBeMoved
    end
  end

  describe '#move_to_backlog' do
    it 'should not allow a theme to be moved if any of the stories are assigned to a sprint' do
      backlog_target = Factory.create(:backlog)
      story = Factory.create(:story)
      backlog = story.theme.backlog
      sprint = Factory.create(:sprint, :backlog => backlog)
      sprint_story = Factory.create(:sprint_story, :sprint => sprint, :story => story)

      expect { story.theme.move_to_backlog backlog_target }.to raise_error Theme::ThemeCannotBeMoved
    end

    it 'should rename the theme code if one already exists' do
      backlog_target = Factory.create(:backlog)
      story = Factory.create(:story)
      theme = story.theme
      old_backlog = theme.backlog
      source_theme_code = story.theme.code
      theme_conflict = Factory.create(:theme, :backlog => backlog_target, :code => source_theme_code)

      theme.move_to_backlog backlog_target

      old_backlog.reload
      theme.reload

      old_backlog.themes.count.should == 0
      backlog_target.themes.count.should == 2
      theme_conflict.code.should == source_theme_code # target backlog theme should keep it's theme code
      theme.code.should_not == theme_conflict.code
    end

    it 'should rename the theme name if one already exists' do
      backlog_target = Factory.create(:backlog)
      story = Factory.create(:story)
      theme = story.theme
      old_backlog = theme.backlog
      source_theme_name = story.theme.name
      theme_conflict = Factory.create(:theme, :backlog => backlog_target, :name => source_theme_name)

      theme.move_to_backlog backlog_target

      old_backlog.reload
      theme.reload

      old_backlog.themes.count.should == 0
      backlog_target.themes.count.should == 2
      theme_conflict.name.should == source_theme_name # target backlog theme should keep it's theme code
      theme.name.should_not == theme_conflict.name
    end

    it 'should raise an error if moved to the same backlog' do
      story = Factory.create(:story)
      theme = story.theme

      expect { theme.move_to_backlog theme.backlog }.to raise_error Theme::ThemeCannotBeMoved
    end
  end
end
