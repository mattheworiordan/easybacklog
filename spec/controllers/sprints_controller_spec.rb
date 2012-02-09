# encoding: UTF-8

require 'spec_helper'

describe SprintsController do
  include Devise::TestHelpers
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE) }

  context 'user does not have read access (no rights) to the backlog' do
    before(:each) do
      @sprint = Factory.create(:sprint)
      @account_user = Factory.create(:account_user_with_no_rights, :account => @sprint.backlog.account)
      sign_in @account_user.user
      @params = {
        :backlog_id => @sprint.backlog.id,
        :id => @sprint.id
      }
    end

    it 'should not allow access to criteria index and show' do
      [:index, :show].each do |verb|
        get verb, @params
        response.code.should == '400'
        ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to view this backlog'
      end
    end
  end

  context 'user only has read rights to an account' do
    before(:each) do
      @sprint = Factory.create(:sprint)
      @account_user = Factory.create(:account_user_with_read_rights, :account => @sprint.backlog.account)
      sign_in @account_user.user
      @params = {
        :backlog_id => @sprint.backlog.id,
        :id => @sprint.id
      }
    end

    it 'should allow access to criteria index and show' do
      [:index, :show].each do |verb|
        get verb, @params
        response.code.should == '200'
      end
    end

    it 'should not allow a user to create, update, destroy' do
      [:create, :update, :destroy].each do |verb|
        post verb, @params
        response.code.should == '400'
        ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to edit this backlog'
      end
    end
  end

  context 'user has full rights to an account' do
    before(:each) do
      @sprint = Factory.create(:sprint)
      @account_user = Factory.create(:account_user_with_full_rights, :account => @sprint.backlog.account)
      sign_in @account_user.user
      @params = {
        :backlog_id => @sprint.backlog.id,
        :id => @sprint.id,
        :number_team_members => 2,
        :duration_days => 2
      }
    end

    it 'should allow access to criteria index and show' do
      [:index, :show].each do |verb|
        get verb, @params
        response.code.should == '200'
      end
    end

    it 'should allow a user to create, update, destroy' do
      start_on = Date.today + 2.years
      [:update, :destroy, :create].each do |verb|
        start_on = start_on + 2.days
        post verb, @params.merge(:start_on => start_on)
        response.code.should == '200'
      end
    end
  end
end