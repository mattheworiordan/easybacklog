# encoding: UTF-8

require 'spec_helper'

describe StoriesController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  describe 'Front end API' do
    before(:each) { accept_json }

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

      it 'should not allow access to story index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:forbidden)
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

      it 'should allow access to story index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should not allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          response.code.should == status_code(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should match(/You do not have permission to (edit|delete|create) this (backlog|story)/)
        end
      end

      it 'should not allow a user to move a story to a new theme' do
        post :move_to_theme, @params.merge(:new_theme_id => Factory.create(:theme, :backlog => @story.theme.backlog))
        response.code.should == status_code(:forbidden)
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

      it 'should allow access to story index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should allow a user to move a story to a new theme' do
        post :move_to_theme, @params.merge(:new_theme_id => Factory.create(:theme, :backlog => @story.theme.backlog))
        response.code.should == status_code(:ok)
      end
    end
  end

  describe 'API' do
    let(:account) { Factory.create(:account_with_user) }
    let(:user) { account.users.first }
    let(:user_token) { Factory.create(:user_token, :user => user) }
    let(:backlog) { Factory.create(:backlog, :account => account) }
    let(:theme) { Factory.create(:theme, :backlog => backlog) }
    let(:story) { Factory.create(:story, :theme => theme) }

    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0, :theme_id => theme.id }
      response.code.should == status_code(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Story does not exist/i)
    end

    def expect_permission_error(http_verb)
      backlog2 = Factory.create(:backlog, :account => account)
      theme2 = Factory.create(:theme, :backlog => backlog2)
      story2 = Factory.create(:story, :theme => theme2)
      # assign the user no rights to this backlog
      Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
      get http_verb, { :id => story2.id, :theme_id => theme2.id }
      response.code.should == status_code(:forbidden)
    end

    context 'index' do
      before(:each) { 2.times { Factory.create(:acceptance_criterion, :story => story) } }

      it 'should return a 404 error if the theme id does not exist' do
        get :index, { :theme_id => 0 }
        response.code.should == status_code(:not_found)
      end

      it 'should return an error if the user does not have access to the backlog' do
        get :index, { :theme_id => Factory.create(:theme).id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return a list of stories' do
        get :index, { :theme_id => theme.id }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == story.id
        json.first['acceptance_criteria'].should be_blank
      end

      it 'should return a list of stories with associated data if requested' do
        get :index, { :theme_id => theme.id, :include_associated_data => true }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == story.id
        json.first['acceptance_criteria'].should be_present
        json.first['acceptance_criteria'].length.should == 2
      end

      it 'should support XML' do
        accept_xml
        get :index, { :theme_id => theme.id }
        response.code.should == status_code(:ok)
        xml = XMLObject.new(response.body)
        xml.story.id.to_i.should == story.id
      end
    end

    context 'show' do
      before(:each) { 2.times { Factory.create(:acceptance_criterion, :story => story) } }

      it 'should return a single story' do
        get :show, { :id => story.id, :theme_id => theme.id }

        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == story.id
        json['comments'].should == story.comments
        json.keys.should include('id', 'theme_id','unique_id','as_a','i_want_to','so_i_can','comments','score_50','score_90','position','color')
        json.keys.should include('created_at','updated_at')
        json.keys.should_not include('score_statistics')
        json['acceptance_criteria'].should be_blank
      end

      it 'should return all children' do
        get :show, { :id => story.id, :theme_id => theme.id, :include_associated_data => true }

        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == story.id
        json['acceptance_criteria'].length.should == 2
      end

      it 'should not return score_90 and score_50 if using single score system' do
        backlog.update_attribute :use_50_90, false
        get :show, { :id => story.id, :theme_id => theme.id }
        json = JSON.parse(response.body)
        json.keys.should_not include('score_50','score_90')
        json.keys.should include('score')
        json['score'].to_i.should == story.score.to_i
      end

      it 'should not return score if using single score system' do
        backlog.update_attribute :use_50_90, true
        get :show, { :id => story.id, :theme_id => theme.id }
        json = JSON.parse(response.body)
        json.keys.should include('score_50','score_90')
        json.keys.should_not include('score')
        json['score_50'].to_i.should == story.score_50.to_i
      end

      it('should return a 404 error if the id does not exist') { expect_404(:show) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show) }
    end

    context 'create' do
      it 'should allow new stories to be created' do
        story
        theme.stories.length.should == 1
        post :create, { :theme_id => theme.id, :as_a => 'New name' }
        response.code.should == status_code(:created)
        theme.reload
        theme.stories.length.should == 2
        theme.stories.last.as_a.should == 'New name'
      end

      it 'should return an error when trying to assign to protected variables' do
        put :create, { :theme_id => theme.id, :as_a => 'New name', :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :create, { :id => story.id, :theme_id => theme.id, :score_50 => 'a' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Score 50/)
        json['errors'].first.should match(/Score 50/)
      end

      it 'should return an error if the current user does not have permission to create the story' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :create, { :theme_id => theme.id, :as_a => 'New name' }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to create this story/)
      end

      it 'should return an error if the backlog is not editable' do
        theme
        backlog.mark_archived
        put :create, { :theme_id => theme.id, :as_a => 'New name' }
        response.code.should == status_code(:forbidden)
      end
    end

    context 'update' do
      it 'should allow updates' do
        put :update, { :id => story.id, :theme_id => theme.id, :as_a => 'New name' }
        response.code.should == status_code(:no_content)
        story.reload
        story.as_a.should == 'New name'
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => story.id, :theme_id => theme.id, :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :update, { :id => story.id, :theme_id => theme.id, :score_50 => 'a' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Score 50/)
        json['errors'].first.should match(/Score 50/)
      end

      it 'should return an error if the backlog is not editable' do
        story # create story before backlog marked as archived
        backlog.mark_archived
        put :update, { :id => story.id, :theme_id => theme.id, :as_a => 'New name' }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :update, { :id => story.id, :theme_id => theme.id, :as_a => 'New name' }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to edit this backlog/)
      end

      it 'should allow updates to score when using a single scoring system' do
        backlog.update_attribute :use_50_90, false
        story.score = 1
        story.save!
        put :update, { :id => story.id, :theme_id => theme.id, :score => 13 }
        story.reload
        story.score.to_i.should == 13
      end

      it 'should allow updates to score_50 and score_90 when using a dual scoring system' do
        backlog.update_attribute :use_50_90, true
        story.score_50 = 1
        story.score_90 = 2
        story.save!
        put :update, { :id => story.id, :theme_id => theme.id, :score_50 => 13, :score_90 => 21 }
        story.reload
        story.score_50.to_i.should == 13
        story.score_90.to_i.should == 21
      end

      it('should return a 404 error if the id does not exist') { expect_404(:update) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:update) }
    end

    context 'destroy' do
      it 'should allow a story to be deleted' do
        story # create story
        theme.stories.should include(story)
        delete :destroy, { :id => story.id, :theme_id => theme.id }
        response.code.should == status_code(:no_content)
        theme.reload
        theme.stories.should_not include(story)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        delete :destroy, { :id => story.id, :theme_id => theme.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to delete this story/)
      end

      it 'should return a forbidden error if the story cannot be deleted' do
        story # create story before backlog marked as archived
        backlog.mark_archived
        delete :destroy, { :id => story.id, :theme_id => theme.id }
        response.code.should == status_code(:forbidden)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:destroy) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy) }
    end

    context 'move story to another theme' do
      let(:theme2) { Factory.create(:theme, :backlog => backlog) }

      it 'should allow the story to be reassigned to another theme' do
        post :move_to_theme, { :id => story.id, :theme_id => theme.id, :new_theme_id => theme2.id }
        response.code.should == status_code(:no_content)
        theme2.stories.should include(story)
        theme.reload
        theme.stories.should_not include(story)
      end

      it 'should return an error if the target theme does not exist' do
        post :move_to_theme, { :id => story.id, :theme_id => theme.id, :new_theme_id => 0 }
        response.code.should == status_code(:not_found)
      end

      it 'should return an error if the theme could not be found from this backlog' do
        post :move_to_theme, { :id => story.id, :theme_id => theme.id, :new_theme_id => Factory.create(:theme).id }
        response.code.should == status_code(:forbidden)
      end
    end
  end
end