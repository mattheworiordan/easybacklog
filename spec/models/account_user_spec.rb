# encoding: UTF-8

require 'spec_helper'

describe AccountUser do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:accepted_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  it 'should upgrade privileges' do
    account = Factory.create(:account)
    user = Factory.create(:user)
    account.add_user user, Privilege.none

    account.account_users.first.upgrade_privilege Privilege.find(:read)
    account.reload
    account.account_users.first.privilege.should == Privilege.find(:read)

    account.account_users.first.upgrade_privilege Privilege.find(:full)
    account.reload
    account.account_users.first.privilege.should == Privilege.find(:full)

    account.account_users.first.upgrade_privilege Privilege.find(:none)
    account.reload
    account.account_users.first.privilege.should == Privilege.find(:full)
  end

  it 'should return a privilege object' do
    account = Factory.create(:account)
    user = Factory.create(:user)
    account.add_user user, 'does not exist'

    account.account_users.first.privilege.should == Privilege.none
  end

  it 'should allow privilege updates with an object or string' do
    account = Factory.create(:account)
    user = Factory.create(:user)
    account.add_user user, 'does not exist'

    au = account.account_users.first
    au.privilege = 'read'
    au.save!
    account.reload
    account.account_users.first.privilege.should == Privilege.find(:read)

    au = account.account_users.first
    au.privilege = Privilege.highest
    au.save!
    account.account_users.first.privilege.should == Privilege.find(:full)
  end

  it 'should automatically assign full access privileges to the example backlog for new account users' do
    account = Factory.create(:account)
    old_user = Factory.create(:user)
    account.add_user old_user, :none
    example_backlog = account.add_example_backlog(old_user)

    new_user = Factory.create(:user)
    account.add_user new_user, :read

    example_backlog.can?(:read, old_user).should be_false
    example_backlog.can?(:full, new_user).should be_true
  end
end
