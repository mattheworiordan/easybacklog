# encoding: UTF-8

require 'spec_helper'

describe AcceptanceCriteriaController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  describe 'Front end API' do
    before(:each) { accept_json }

    context 'user does not have read access (no rights) to the backlog' do
      before(:each) do
        @criteria = Factory.create(:acceptance_criterion)
        @account_user = Factory.create(:account_user_with_no_rights, :account => @criteria.story.theme.backlog.account)
        sign_in @account_user.user
        @params = {
          :story_id => @criteria.story.id,
          :id => @criteria.id
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
        @criteria = Factory.create(:acceptance_criterion)
        @account_user = Factory.create(:account_user_with_read_rights, :account => @criteria.story.theme.backlog.account)
        sign_in @account_user.user
        @params = {
          :story_id => @criteria.story.id,
          :id => @criteria.id
        }
      end

      it 'should allow access to criteria index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should not allow a user to new, create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          response.code.should == status_code(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should match(/You do not have permission to (create|edit|delete) this (backlog|acceptance criterion)/)
        end
      end
    end

    context 'user has full rights to an account' do
      before(:each) do
        @criteria = Factory.create(:acceptance_criterion)
        @account_user = Factory.create(:account_user_with_full_rights, :account => @criteria.story.theme.backlog.account)
        sign_in @account_user.user
        @params = {
          :story_id => @criteria.story.id,
          :id => @criteria.id,
          :criterion => 'criterion'
        }
      end

      it 'should allow access to criteria index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should allow a user to new, create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          [status_code(:ok),status_code(:created)].should include(response.code)
        end
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
    let(:criterion) { Factory.create(:acceptance_criterion, :story => story) }

    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0, :story_id => story.id }
      response.code.should == status_code(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Acceptance criterion does not exist/i)
    end

    def expect_permission_error(http_verb)
      backlog2 = Factory.create(:backlog, :account => account)
      theme2 = Factory.create(:theme, :backlog => backlog2)
      story2 = Factory.create(:story, :theme => theme2)
      criterion2 = Factory.create(:acceptance_criterion, :story => story2)
      # assign the user no rights to this backlog
      Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
      get http_verb, { :id => criterion2.id, :story_id => story2.id }
      response.code.should == status_code(:forbidden)
    end

    context 'index' do
      before(:each) { criterion }

      it 'should return a 404 error if the story id does not exist' do
        get :index, { :story_id => 0 }
        response.code.should == status_code(:not_found)
      end

      it 'should return an error if the user does not have access to the backlog' do
        get :index, { :story_id => Factory.create(:story).id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return a list of criteria' do
        get :index, { :story_id => story.id }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == criterion.id
      end

      it 'should support XML' do
        accept_xml
        get :index, { :story_id => story.id }
        response.code.should == status_code(:ok)
        xml = XMLObject.new(response.body)
        xml['acceptance-criterion'].id.to_i.should == criterion.id
      end
    end

    context 'show' do
      it 'should return a single criterion' do
        get :show, { :id => criterion.id, :story_id => story.id }

        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == criterion.id
        json['position'].to_i.should == criterion.position
        json.keys.should include('id','story_id','criterion','position')
      end

      it('should return a 404 error if the id does not exist') { expect_404(:show) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show) }
    end

    context 'create' do
      it 'should allow new citeria to be created' do
        criterion
        story.acceptance_criteria.length.should == 1
        post :create, { :story_id => story.id, :criterion => 'New name' }
        response.code.should == status_code(:created)
        story.reload
        story.acceptance_criteria.length.should == 2
        story.acceptance_criteria.last.criterion.should == 'New name'
      end

      it 'should return an error when trying to assign to protected variables' do
        put :create, { :story_id => story.id, :criterion => 'New name', :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the current user does not have permission to create the criterion' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :create, { :story_id => story.id, :criterion => 'New name' }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to create this acceptance criterion/)
      end

      it 'should return an error if the backlog is not editable' do
        criterion # create story before backlog marked as archived
        backlog.mark_archived
        put :create, { :story_id => story.id, :criterion => 'New name' }
        response.code.should == status_code(:forbidden)
      end
    end

    context 'update' do
      it 'should allow updates' do
        put :update, { :id => criterion.id, :story_id => story.id, :criterion => 'New name' }
        response.code.should == status_code(:no_content)
        criterion.reload
        criterion.criterion.should == 'New name'
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => criterion.id, :story_id => story.id, :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the backlog is not editable' do
        criterion # create story before backlog marked as archived
        backlog.mark_archived
        put :update, { :id => criterion.id, :story_id => story.id, :criterion => 'New name' }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :update, { :id => criterion.id, :story_id => story.id, :criterion => 'New name' }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to edit this backlog/)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:update) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:update) }
    end

    context 'destroy' do
      it 'should allow a criterion to be deleted' do
        criterion # create story
        story.acceptance_criteria.should include(criterion)
        delete :destroy, { :id => criterion.id, :story_id => story.id }
        response.code.should == status_code(:no_content)
        story.reload
        story.acceptance_criteria.should_not include(criterion)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        delete :destroy, { :id => criterion.id, :story_id => story.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to delete this acceptance criterion/)
      end

      it 'should return a forbidden error if the story cannot be deleted' do
        criterion # create story before backlog marked as archived
        backlog.mark_archived
        delete :destroy, { :id => criterion.id, :story_id => story.id }
        response.code.should == status_code(:forbidden)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:destroy) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy) }
    end
  end
end