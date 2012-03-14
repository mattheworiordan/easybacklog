# encoding: UTF-8

require 'spec_helper'

describe ThemesController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  context 'user does not have read access (no rights) to the backlog' do
    before(:each) do
      @theme = Factory.create(:theme)
      @account_user = Factory.create(:account_user_with_no_rights, :account => @theme.backlog.account)
      sign_in @account_user.user
      @params = {
        :backlog_id => @theme.backlog.id,
        :id => @theme.id
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
      @theme = Factory.create(:theme)
      @account_user = Factory.create(:account_user_with_read_rights, :account => @theme.backlog.account)
      sign_in @account_user.user
      @params = {
        :backlog_id => @theme.backlog.id,
        :id => @theme.id
      }
    end

    it 'should allow access to criteria index and show' do
      [:index, :show].each do |verb|
        get verb, @params
        response.code.should == '200'
      end
    end

    it 'should not allow a user to new, create, update, destroy' do
      [:new, :create, :update, :destroy].each do |verb|
        post verb, @params
        response.code.should == '400'
        ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to edit this backlog'
      end
    end

    it 'should not allow a user to renumber the stories' do
      post :re_number_stories, @params
      response.code.should == '400'
      ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to edit this backlog'
    end
  end

  context 'user has full rights to an account' do
    before(:each) do
      @theme = Factory.create(:theme)
      @account_user = Factory.create(:account_user_with_full_rights, :account => @theme.backlog.account)
      sign_in @account_user.user
      @params = {
        :backlog_id => @theme.backlog.id,
        :id => @theme.id
      }
    end

    it 'should allow access to criteria index and show' do
      [:index, :show].each do |verb|
        get verb, @params
        response.code.should == '200'
      end
    end

    it 'should allow a user to new, create, update, destroy' do
      [:new, :create, :update, :destroy].each do |verb|
        post verb, @params.merge(:name => "Theme #{verb}")
        response.code.should == '200'
      end
    end

    it 'should allow a user to renumber the stories' do
      post :re_number_stories, @params
      response.code.should == '200'
    end
  end
end