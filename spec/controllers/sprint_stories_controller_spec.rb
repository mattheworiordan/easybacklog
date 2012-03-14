# encoding: UTF-8

require 'spec_helper'

describe SprintStoriesController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  context 'user does not have read access (no rights) to the backlog' do
    before(:each) do
      @sprint_story = Factory.create(:sprint_story)
      @account_user = Factory.create(:account_user_with_no_rights, :account => @sprint_story.sprint.backlog.account)
      sign_in @account_user.user
      @params = {
        :sprint_id => @sprint_story.sprint.id,
        :id => @sprint_story.id
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
      @sprint_story = Factory.create(:sprint_story)
      @sprint_story2 = Factory.create(:sprint_story, :sprint => @sprint_story.sprint)
      @account_user = Factory.create(:account_user_with_read_rights, :account => @sprint_story.sprint.backlog.account)
      sign_in @account_user.user
      @params = {
        :sprint_id => @sprint_story.sprint.id,
        :id => @sprint_story.id
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
        ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to update the status of stories'
      end
    end

    it 'should not allow a user to reorder' do
      post :update_order, @params.merge(:ids => "#{@sprint_story2.id},#{@sprint_story.id}")
      response.code.should == '400'
      ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to update the order of stories'
    end
  end

  context 'user has read and status update rights to an account' do
    before(:each) do
      @sprint_story = Factory.create(:sprint_story)
      @sprint_story2 = Factory.create(:sprint_story, :sprint => @sprint_story.sprint)
      @account_user = Factory.create(:account_user_with_read_status_rights, :account => @sprint_story.sprint.backlog.account)
      sign_in @account_user.user
      @params = {
        :sprint_id => @sprint_story.sprint.id,
        :id => @sprint_story.id
      }
    end

    it 'should allow access to criteria index and show' do
      [:index, :show].each do |verb|
        get verb, @params
        response.code.should == '200'
      end
    end

    it 'should allow a user to create, update, destroy' do
      [:create, :update, :destroy].each do |verb|
        post verb, @params.merge(:story_id => Factory.create(:story, :theme => @sprint_story.story.theme).id)
        response.code.should == '200'
      end
    end

    it 'should not allow a user to reorder' do
      put :update_order, @params.merge(:ids => [@sprint_story2.id,@sprint_story.id])
      response.code.should == '200'
    end
  end
end