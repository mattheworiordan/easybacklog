# encoding: UTF-8

require 'spec_helper'

describe Creators::ThemeCreator do
  let(:backlog_50_90) { Factory.create(:backlog, :use_50_90 => true) }
  let(:backlog_single_score) { Factory.create(:backlog, :use_50_90 => false) }

  let(:theme_data) do
    theme = double('Theme')
    theme.stub(:name) { 'Alpha Beta Crud' }
    theme.stub(:code) { 'ABC' }

    theme.stub(:stories) do
      (1..2).map do |index|
        story = double('Story')
        story.stub(:unique_id) { index }
        story.stub(:as_a) { "user #{index}" }
        story.stub(:i_want_to) { "do #{index}" }
        story.stub(:so_i_can) { "act on #{index}" }
        story.stub(:comments) { "comments #{index}" }
        story.stub(:score_50) { 1 }
        story.stub(:score_90) { 2 }
        story.stub(:score) { 5 }
        story.stub(:color) { 'ffffff' }
        story.stub(:criteria) do
          (1..2).map do |c_index|
            "content #{c_index}"
          end
        end
        story
      end
    end

    theme
  end

  it 'should create themes and stories using 50/90 scoring from sprint data' do
    theme = subject.create theme_data, backlog_50_90

    backlog_50_90.themes.count.should == 1
    stories = backlog_50_90.themes.first.stories

    stories.first.unique_id.should == 1
    stories.last.unique_id.should == 2

    stories.first.as_a.should == 'user 1'
    stories.last.i_want_to.should == 'do 2'
    stories.first.so_i_can.should == 'act on 1'
    stories.last.comments.should == 'comments 2'
    stories.first.score_50.should == 1
    stories.last.score_90.should == 2
    stories.first.color.should == 'ffffff'

    stories.first.acceptance_criteria.count.should == 2
    criteria = stories.first.acceptance_criteria
    criteria.first.criterion.should == 'content 1'
    criteria.last.criterion.should == 'content 2'
  end

  it 'should create themes and stories using single scoring from sprint data' do
    theme = subject.create theme_data, backlog_single_score

    backlog_single_score.themes.count.should == 1
    stories = backlog_single_score.themes.first.stories

    stories.first.score_50.should == 5
    stories.last.score_90.should == 5
    stories.last.score.should == 5
  end
end
