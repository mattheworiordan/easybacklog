# encoding: UTF-8

require 'spec_helper'

describe Creators::BacklogCreator do
  let(:account) { Factory.create(:account_with_user, :name => "Acme") }
  let(:user) { account.users.first }
  let(:backlog_double) do
    backlog_double = double('Backlog')
    backlog_double.stub(:name) { 'Backlog name' }
    backlog_double.stub(:velocity) { 3 }
    backlog_double.stub(:rate) { 800 }
    backlog_double.stub(:use_50_90) { true }
    backlog_double.stub(:created_at) { '1 Jan 2010' }
    backlog_double.stub(:updated_at) { '1 Jan 2011' }

    # assume empty backlog in terms of sprints or themes for now
    backlog_double.stub(:themes) { nil }
    backlog_double.stub(:snapshots) { nil }
    backlog_double.stub(:sprints) { nil }
    backlog_double
  end

  it 'should create a backlog with a simple backlog data representation' do
    backlog = subject.create backlog_double, account, user

    backlog.name.should == 'Backlog name'
    backlog.velocity.should == 3
    backlog.rate.should == 800
    backlog.use_50_90.should be_true
    backlog.created_at.should == Date.parse('1 Jan 2010')
    backlog.updated_at.should == Date.parse('1 Jan 2011')
  end

  it 'should not update the account defaults when backlog is an example' do
    account.defaults_set.should be_blank
    backlog = subject.create backlog_double, account, user
    account.reload
    account.defaults_set.should be_blank
  end

  it 'should create themes from backlog data with themes' do
    theme = double('Theme')
    theme.stub(:name) { 'First theme' }
    theme.stub(:code) { 'FTE' }
    theme.stub(:stories) { nil }
    backlog_double.stub(:themes) { [theme] }
    backlog = subject.create backlog_double, account, user

    backlog.themes.count.should == 1
    backlog.themes.first.instance_eval do
      name.should == 'First theme'
      code.should == 'FTE'
      created_at.should == Date.parse('1 Jan 2010')
      updated_at.should == Date.parse('1 Jan 2011')
    end
  end

  it 'should create manual snapshots from backlog data with snapshots' do
    snapshot_double = double('Backlog')
    snapshot_double.stub(:name) { 'Snapshot name' }
    snapshot_double.stub(:velocity) { 4 }
    snapshot_double.stub(:rate) { 500 }
    snapshot_double.stub(:use_50_90) { false }
    snapshot_double.stub(:created_at) { '1 Feb 2010' }
    snapshot_double.stub(:updated_at) { '1 Feb 2011' }
    snapshot_double.stub(:themes) { nil }
    backlog_double.stub(:snapshots) { [snapshot_double] }

    account.defaults_set.should be_blank
    backlog = subject.create backlog_double, account, user

    # account defaults should never set by snapshots
    account.reload
    account.defaults_set.should be_blank

    backlog.snapshots.count.should == 1
    backlog.snapshots.first.instance_eval do
      name.should == 'Snapshot name'
      velocity.should == 4
      rate.should == 500
      use_50_90.should == false
      created_at.should == Date.parse('1 Feb 2010')
      updated_at.should == Date.parse('1 Feb 2011')
    end
  end

  it 'should create sprints with snapshots from backlog data with sprints and sprint snapshots' do
    sprint_double = double('Sprint')
    sprint_double.stub(:iteration) { 1 }
    sprint_double.stub(:start_on) { '1 Apr 2010' }
    sprint_double.stub(:completed?) { true }
    sprint_double.stub(:completed_at) { '1 Jun 2010 00:00:00 UTC' }
    sprint_double.stub(:number_team_members) { 2 }
    sprint_double.stub(:duration_days) { 3 }
    sprint_double.stub(:sprint_stories) { nil }

    snapshot_double = double('Backlog')
    snapshot_double.stub(:name) { 'Sprint 1 Snapshot' }
    snapshot_double.stub(:velocity) { 5 }
    snapshot_double.stub(:rate) { 600 }
    snapshot_double.stub(:use_50_90) { true }
    snapshot_double.stub(:created_at) { '1 Mar 2010' }
    snapshot_double.stub(:updated_at) { '1 Mar 2011' }
    snapshot_double.stub(:themes) { nil }
    sprint_double.stub(:snapshot) { snapshot_double }

    backlog_double.stub(:sprints) { [sprint_double] }
    account.defaults_set.should be_blank
    backlog = subject.create backlog_double, account, user

    # account defaults should never set by snapshots
    account.reload
    account.defaults_set.should be_blank

    backlog.sprints.count.should == 1
    backlog.sprints.first.instance_eval do
      iteration.should == 1
      start_on.should == Date.parse('1 Apr 2010')
      completed_at.should == Time.parse('1 Jun 2010 00:00:00 UTC')
      number_team_members.should == 2
      duration_days.should == 3
      created_at.should == Date.parse('1 Jan 2010')
      updated_at.should == Date.parse('1 Jan 2011')
      snapshot.created_at.should == Date.parse('1 Mar 2010')
      snapshot.updated_at.should == Date.parse('1 Mar 2011')
    end

    backlog.sprints.first.snapshot.should be_present
    snapshot = backlog.sprints.first.snapshot
    snapshot.name.should == 'Sprint 1 Snapshot'
    snapshot.velocity.should == 5
    snapshot.rate.should == 600
    snapshot.use_50_90.should == true
    snapshot.created_at.should == Date.parse('1 Mar 2010')
    snapshot.updated_at.should == Date.parse('1 Mar 2011')
  end
end
