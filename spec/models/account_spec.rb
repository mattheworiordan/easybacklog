# encoding: UTF-8

require 'spec_helper'

describe Account do
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
end
