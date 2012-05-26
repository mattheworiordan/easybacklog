# encoding: UTF-8

require 'spec_helper'

describe SprintStoriesController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  describe 'Front end API' do
    before(:each) { accept_json }

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
          response.code.should == status_code(:forbidden)
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
          response.code.should == status_code(:ok)
        end
      end

      it 'should not allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          response.code.should == status_code(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to update the status of stories'
        end
      end

      it 'should not allow a user to reorder' do
        post :update_order, @params.merge(:ids => "#{@sprint_story2.id},#{@sprint_story.id}")
        response.code.should == status_code(:forbidden)
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
          response.code.should == status_code(:ok)
        end
      end

      it 'should allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params.merge(:story_id => Factory.create(:story, :theme => @sprint_story.story.theme).id)
          [status_code(:ok),status_code(:created)].should include(response.code)
        end
      end

      it 'should not allow a user to reorder' do
        put :update_order, @params.merge(:ids => [@sprint_story2.id,@sprint_story.id])
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
    let(:sprint) { Factory.create(:sprint, :backlog => backlog) }
    let(:sprint_story) { Factory.create(:sprint_story, :sprint => sprint, :story => story) }

    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0, :sprint_id => sprint.id }
      response.code.should == status_code(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Sprint story does not exist/i)
    end

    def expect_permission_error(http_verb)
      backlog2 = Factory.create(:backlog, :account => account)
      theme2 = Factory.create(:theme, :backlog => backlog2)
      story2 = Factory.create(:story, :theme => theme2)
      sprint2 = Factory.create(:sprint, :backlog => backlog2)
      sprint_story2 = Factory.create(:sprint_story, :sprint => sprint2)
      # assign the user no rights to this backlog
      Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
      get http_verb, { :id => sprint_story2.id, :sprint_id => sprint2.id }
      response.code.should == status_code(:forbidden)
    end

    context 'index' do
      it 'should return a 404 error if the sprint id does not exist' do
        get :index, { :sprint_id => 0 }
        response.code.should == status_code(:not_found)
      end

      it 'should return an error if the user does not have access to the backlog' do
        get :index, { :sprint_id => Factory.create(:sprint).id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return a list of sprint stories' do
        sprint_story
        get :index, { :sprint_id => sprint.id }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == sprint_story.id
      end

      it 'should support XML' do
        accept_xml
        sprint_story
        get :index, { :sprint_id => sprint.id }
        response.code.should == status_code(:ok)
        xml = XMLObject.new(response.body)
        xml['sprint-story'].id.to_i.should == sprint_story.id
      end
    end

    context 'show' do
      it 'should return a single sprint story' do
        get :show, { :id => sprint_story.id, :sprint_id => sprint.id }

        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == sprint_story.id
        json['story_id'].should == sprint_story.story.id
        json.keys.should include('id','sprint_id','story_id','sprint_story_status_id','position')
        json.keys.should include('created_at','updated_at')
      end

      it('should return a 404 error if the id does not exist') { expect_404(:show) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show) }
    end

    context 'create' do
      it 'should allow new sprint stories to be created' do
        sprint_story
        sprint.sprint_stories.length.should == 1
        story2 = Factory.create(:story, :theme => theme)
        post :create, { :sprint_id => sprint.id, :story_id => story2.id, :sprint_story_status_id => default_sprint_story_status.id }
        response.code.should == status_code(:created)
        sprint.reload
        sprint.sprint_stories.length.should == 2
        sprint.sprint_stories.last.sprint_story_status_id.should == default_sprint_story_status.id
      end

      it 'should return an error when trying to assign to protected variables' do
        put :create, { :sprint_id => sprint.id, :story_id => story.id, :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :create, { :sprint_id => sprint.id, :sprint_story_status_id => default_sprint_story_status.id }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Story/)
        json['errors'].first.should match(/Story/)
      end

      it 'should return an error if the current user does not have permission to create the sprint story' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :create, { :sprint_id => sprint.id, :story_id => story.id, :sprint_story_status_id => default_sprint_story_status.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to update the status of stories/)
      end

      it 'should return an error if the backlog is not editable' do
        sprint_story
        backlog.mark_archived
        put :create, { :sprint_id => sprint.id, :story_id => story.id, :sprint_story_status_id => default_sprint_story_status.id }
        response.code.should == status_code(:forbidden)
      end
    end

    context 'update' do
      it 'should allow updates' do
        put :update, { :id => sprint_story.id, :sprint_id => sprint.id, :sprint_story_status_id => done_sprint_story_status.id }
        response.code.should == status_code(:no_content)
        sprint_story.reload
        sprint_story.sprint_story_status_id.should == done_sprint_story_status.id
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => sprint_story.id, :sprint_id => sprint.id, :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :update, { :id => sprint_story.id, :sprint_id => 0 }
        response.code.should == status_code(:not_found)
        json = JSON.parse(response.body)
        json['message'].should match(/Sprint story/)
      end

      it 'should return an error if the backlog is not editable' do
        sprint_story # create story before backlog marked as archived
        backlog.mark_archived
        put :update, { :id => sprint_story.id, :sprint_id => sprint.id, :sprint_story_status_id => done_sprint_story_status.id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error if the spring is completed' do
        sprint_story # create story before backlog marked as archived
        sprint_story.update_attributes! :sprint_story_status_id => done_sprint_story_status.id
        sprint.reload
        sprint.mark_as_complete
        put :update, { :id => sprint_story.id, :sprint_id => sprint.id, :sprint_story_status_id => done_sprint_story_status.id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :update, { :id => sprint_story.id, :sprint_id => sprint.id, :sprint_story_status_id => done_sprint_story_status.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to update the status of stories/)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:update) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:update) }
    end

    context 'destroy' do
      before(:each) { sprint_story }

      it 'should allow a sprint story to be deleted' do
        sprint.sprint_stories.should include(sprint_story)
        delete :destroy, { :id => sprint_story.id, :sprint_id => sprint.id }
        response.code.should == status_code(:no_content)
        sprint.reload
        sprint.sprint_stories.should_not include(sprint_story)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        delete :destroy, { :id => sprint_story.id, :sprint_id => sprint.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to update the status of stories/)
      end

      it 'should return a forbidden error if the story cannot be deleted' do
        backlog.mark_archived
        delete :destroy, { :id => sprint_story.id, :sprint_id => sprint.id }
        response.code.should == status_code(:forbidden)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:destroy) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy) }
    end
  end
end