# encoding: UTF-8

require 'spec_helper'

describe StoriesController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE) }

  context 'user does not have read access (no rights) to the backlog' do
    before(:each) do
      @story = Factory.create(:story)
      @account_user = Factory.create(:account_user_with_no_rights, :account => @story.theme.backlog.account)
      sign_in @account_user.user
      @params = {
        :theme_id => @story.theme.id,
        :id => @story.id
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
      @story = Factory.create(:story)
      @account_user = Factory.create(:account_user_with_read_rights, :account => @story.theme.backlog.account)
      sign_in @account_user.user
      @params = {
        :theme_id => @story.theme.id,
        :id => @story.id
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

    it 'should not allow a user to move a story to a new theme' do
      post :move_to_theme, @params.merge(:new_theme_id => Factory.create(:theme, :backlog => @story.theme.backlog))
      response.code.should == '400'
      ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to edit this backlog'
    end
  end

  context 'user has full rights to an account' do
    before(:each) do
      @story = Factory.create(:story)
      @account_user = Factory.create(:account_user_with_full_rights, :account => @story.theme.backlog.account)
      sign_in @account_user.user
      @params = {
        :theme_id => @story.theme.id,
        :id => @story.id,
        :as_a => 'something'
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
        post verb, @params
        response.code.should == '200'
      end
    end

    it 'should allow a user to move a story to a new theme' do
      post :move_to_theme, @params.merge(:new_theme_id => Factory.create(:theme, :backlog => @story.theme.backlog))
      response.code.should == '200'
    end
  end
end