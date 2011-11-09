# encoding: UTF-8

require 'spec_helper'

describe Creators::SprintCreator do
  # set up 2 stories in two themes
  let(:backlog) { Factory.create(:backlog) }
  let(:theme_1) { Factory.create(:theme, :backlog => backlog) }
  let(:theme_2) { Factory.create(:theme, :backlog => backlog) }
  let(:story_1) { Factory.create(:story, :theme => theme_1) }
  let(:story_2) { Factory.create(:story, :theme => theme_2) }

  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE) }

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
    sprint_story.stub(:status_code) { done_sprint_story_status.code }
    sprint_story.stub(:score_50_when_assigned) { 3 }
    sprint_story.stub(:score_90_when_assigned) { 5 }

    sprint_story_2 = double('SprintStory')
    sprint_story_2.stub(:code) { "#{story_2.theme.code}#{story_2.unique_id}" }
    sprint_story_2.stub(:status_code) { done_sprint_story_status.code }
    sprint_story_2.stub(:score_50_when_assigned) { 5 }
    sprint_story_2.stub(:score_90_when_assigned) { 8 }

    data.stub(:stories) { [sprint_story, sprint_story_2] }
    data
  end

  it 'should create sprint stories from sprint data' do
    sprint = subject.create sprint_data, backlog

    backlog.sprints.count.should == 1

    sprint_stories = backlog.sprints.first.sprint_stories
    sprint_stories.count.should == 2

    sprint_stories.first.sprint_story_status.should == done_sprint_story_status
    sprint_stories.first.story.should == story_1
    sprint_stories.first.sprint_score_50_when_assigned.should == 3
    sprint_stories.first.sprint_score_90_when_assigned.should == 5

    sprint_stories.last.sprint_story_status.should == done_sprint_story_status
    sprint_stories.last.story.should == story_2
    sprint_stories.last.sprint_score_50_when_assigned.should == 5
    sprint_stories.last.sprint_score_90_when_assigned.should == 8
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
    snapshot = backlog.sprints.first.snapshot
    snapshot.name.should == 'Sprint 1 Snapshot'
    snapshot.rate.should == 600
  end
end
