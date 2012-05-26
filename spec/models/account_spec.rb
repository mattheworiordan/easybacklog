# encoding: UTF-8

require 'spec_helper'

describe Account do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  it 'should create a company with inherited settings' do
    account = Factory.create(:account, :name => "Acme")
    new_company = account.create_company("Microsoft")
    new_company.default_use_50_90.should == account.default_use_50_90
    new_company.default_velocity.should == account.default_velocity
    new_company.default_rate.should == account.default_rate
  end

  it 'should create a company with provided settings if applicable' do
    account = Factory.create(:account, :name => "Acme")
    new_company = account.create_company("Microsoft", :default_use_50_90 => true, :default_velocity => 10, :default_rate => 20)
    new_company.default_use_50_90.should == true
    new_company.default_velocity.should == 10
    new_company.default_rate.should == 20
  end

  it 'should use an existing company if creating a new one with the same name' do
    account = Factory.create(:account, :name => "Acme")
    new_company = account.create_company("Microsoft")
    same_company = account.create_company("Microsoft")
    new_company.should == same_company
    Company.all.count.should == 1
  end

  it 'should return a list of backlogs, not snapshots or sprint snapshots' do
    company = Factory.create(:company)
    account = company.account
    backlog = Factory.create(:backlog, :company => company, :account => account)
    sprint = Factory.create(:sprint, :backlog => backlog)

    sprint.backlog.create_snapshot 'Test'
    sprint.create_snapshot

    account.reload
    company.reload

    # sprint snapshots and backlog snapshots should not be returned in the associations
    account.backlogs.count.should == 1
    company.backlogs.count.should == 1
  end

  it 'should create an example backlog when add_example_backlog is called' do
    Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE)
    Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED)
    Factory.create(:sprint_story_status, :status => 'In progress', :code => SprintStoryStatus::IN_PROGRESS)
    Factory.create(:sprint_story_status, :status => 'Completed', :code => SprintStoryStatus::COMPLETED)

    account = Factory.create(:account_with_user)
    account.add_example_backlog account.users.first
    account.backlogs.first.name.should match(/Example/i)
    account.backlogs.first.themes.count.should > 1
    account.backlogs.first.sprints.count.should > 1
    account.backlogs.first.snapshots.count.should > 0
  end


  it 'should have a default scoring system even when no scoring system has been selected' do
    account = Factory.create(:account)

    # check account does not actually have a scoring rule set
    account.scoring_rule_id.should be_blank
    account.scoring_rule.should == default_scoring_rule
  end

  it 'should only allow a rate if velocity is present' do
    expect { Factory.create(:account, :default_rate => 50, :default_velocity => nil) }.to raise_error ActiveRecord::RecordInvalid, /Default rate cannot be specified if default velocity is empty/

    account = Factory.create(:account, :default_rate => 50, :default_velocity => 5)
    account.default_rate.should == 50
  end

  context "Adding a user" do
    before(:each) do
      @account = Factory.create(:account)
      @user = Factory.create(:user)
    end

    it 'should add user with privilege string' do
      @account.add_user @user, Privilege.highest
      @account.account_users.first.user_id.should == @user.id
      @account.account_users.first.privilege.should == Privilege.highest
    end

    it 'should add user with privilege object' do
      @account.add_user @user, Privilege.none.code
      @account.account_users.first.privilege.should == Privilege.none
    end
  end
end
