# encoding: UTF-8

require 'spec_helper'

describe Creators::ThemeCreator do
  let(:base_created_at) { Time.parse('1 Jan 2011') }
  let(:base_updated_at) { Time.parse('1 Jan 2012') }
  let(:backlog_50_90) { FactoryGirl.create(:backlog, :use_50_90 => true, :created_at => base_created_at, :updated_at => base_updated_at) }
  let(:backlog_single_score) { FactoryGirl.create(:backlog, :use_50_90 => false, :created_at => base_created_at, :updated_at => base_updated_at) }

  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }

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
        story.stub(:acceptance_criteria) do
          (1..2).map do |c_index|
            "content #{c_index}"
          end
        end
        story
      end
    end

    theme
  end

  def check_valid_for_50_90(backlog_50_90)
    default_created_at = base_created_at
    default_updated_at = base_updated_at

    backlog_50_90.themes.count.should == 1
    backlog_50_90.themes.first.instance_eval do
      created_at.should == default_created_at # add these method missing methods to the local var space
      updated_at.should == default_updated_at # add these method missing methods to the local var space

      stories.first.instance_eval do
        unique_id.should == 1
        as_a.should == 'user 1'
        so_i_can.should == 'act on 1'
        score_50.should == 1
        color.should == 'ffffff'
        created_at.should == default_created_at
        updated_at.should == default_updated_at

        acceptance_criteria.instance_eval do
          count.should == 2
          first.criterion.should == 'content 1'
          last.criterion.should == 'content 2'
        end
      end

      stories.last.instance_eval do
        i_want_to.should == 'do 2'
        comments.should == 'comments 2'
        score_90.should == 2
      end
    end
  end

  def check_valid_single_score(backlog_single_score)
    backlog_single_score.themes.count.should == 1
    backlog_single_score.themes.first.stories.instance_eval do
      first.score_50.should == 5.0
      last.score_90.should == 5.0
      last.score.should == 5.0
    end
  end

  it 'should create themes and stories using 50/90 scoring from sprint data' do
    theme = subject.create theme_data, backlog_50_90
    check_valid_for_50_90 backlog_50_90
  end

  it 'should create themes and stories using single scoring from sprint data' do
    theme = subject.create theme_data, backlog_single_score
    check_valid_single_score backlog_single_score
  end

  # SQL methods are for performance, generates a single SQL statement
  it 'using SQL methods it should create themes and stories using 50/90 scoring from sprint data' do
    sql = subject.create_sql theme_data, 1, backlog_50_90
    backlog_50_90.connection.execute sql
    backlog_50_90.reload
    check_valid_for_50_90 backlog_50_90
  end

  # SQL methods are for performance, generates a single SQL statement
  it 'using SQL methods should create themes and stories using single scoring from sprint data' do
    sql = subject.create_sql theme_data, 1, backlog_single_score
    backlog_single_score.connection.execute sql
    backlog_single_score.reload
    check_valid_single_score backlog_single_score
  end
end
