# encoding: UTF-8

require 'spec_helper'

describe Creators::SprintCreator do
  let(:base_created_at) { Time.parse('1 Jan 2011') }
  let(:base_updated_at) { Time.parse('1 Jan 2012') }

  # set up 2 stories in two themes
  let(:backlog) { FactoryGirl.create(:backlog, :created_at => base_created_at, :updated_at => base_updated_at) }
  let(:theme_1) { FactoryGirl.create(:theme, :backlog => backlog) }
  let(:theme_2) { FactoryGirl.create(:theme, :backlog => backlog) }
  let(:story_1) { FactoryGirl.create(:story, :theme => theme_1) }
  let(:story_2) { FactoryGirl.create(:story, :theme => theme_2) }

  let!(:accepted_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }

  let(:sprint_data) do
    data = double('Sprint')
    data.stub(:iteration) { 1 }
    data.stub(:start_on) { '1 Apr 2010' }
    data.stub(:completed?) { true }
    data.stub(:completed_at) { '1 Jun 2010 00:00:00 UTC' }
    data.stub(:number_team_members) { 2 }
    data.stub(:duration_days) { 3 }
    data.stub(:snapshot) { nil }

    sprint_story = double('SprintStory')
    sprint_story.stub(:code) { "#{story_1.theme.code}#{story_1.unique_id}" }
    sprint_story.stub(:status_code) { accepted_sprint_story_status.code }
    sprint_story.stub(:score_50_when_assigned) { 3 }
    sprint_story.stub(:score_90_when_assigned) { 5 }

    sprint_story_2 = double('SprintStory')
    sprint_story_2.stub(:code) { "#{story_2.theme.code}#{story_2.unique_id}" }
    sprint_story_2.stub(:status_code) { accepted_sprint_story_status.code }
    sprint_story_2.stub(:score_50_when_assigned) { 5 }
    sprint_story_2.stub(:score_90_when_assigned) { 8 }

    data.stub(:sprint_stories) { [sprint_story, sprint_story_2] }
    data
  end

  it 'should create sprint stories from sprint data' do
    # create local varaibles as let does not work with instance_eval
    default_created_at = base_created_at
    default_updated_at = base_updated_at
    accepted = accepted_sprint_story_status
    story_one = story_1
    story_two = story_2

    sprint = subject.create sprint_data, backlog

    backlog.sprints.count.should == 1
    backlog.sprints.first.instance_eval do
      created_at.should == default_created_at
      updated_at.should == default_updated_at
    end

    sprint_stories = backlog.sprints.first.sprint_stories
    sprint_stories.count.should == 2

    sprint_stories.first.instance_eval do
      sprint_story_status.should == accepted
      story.should == story_one
      sprint_score_50_when_assigned.should == 3
      sprint_score_90_when_assigned.should == 5
      created_at.should == default_created_at
      updated_at.should == default_updated_at
    end

    sprint_stories.last.instance_eval do
      sprint_story_status.should == accepted
      story.should == story_two
      sprint_score_50_when_assigned.should == 5
      sprint_score_90_when_assigned.should == 8
      created_at.should == default_created_at
      updated_at.should == default_updated_at
    end
  end

  it 'should mark a sprint as complete if completed' do
    sprint = subject.create sprint_data, backlog

    backlog.sprints.first.should be_completed
  end

  it 'should create a snapshot if one exists' do
    snapshot_double = double('Backlog')
    snapshot_double.stub(:name) { 'Sprint 1 Snapshot' }
    snapshot_double.stub(:velocity) { 5 }
    snapshot_double.stub(:rate) { 600 }
    snapshot_double.stub(:use_50_90) { true }
    snapshot_double.stub(:created_at) { '1 Mar 2010' }
    snapshot_double.stub(:updated_at) { '1 Mar 2011' }
    snapshot_double.stub(:themes) { nil }
    sprint_data.stub(:snapshot) { snapshot_double }

    sprint = subject.create sprint_data, backlog

    backlog.sprints.first.snapshot.should be_present
    backlog.sprints.first.snapshot.instance_eval do
      name.should == 'Sprint 1 Snapshot'
      rate.should == 600
      created_at.should == Date.parse('1 Mar 2010')
      updated_at.should == Date.parse('1 Mar 2011')
    end
  end
end
