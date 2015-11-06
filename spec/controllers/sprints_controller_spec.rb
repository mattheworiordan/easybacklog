# encoding: UTF-8

require 'spec_helper'

describe SprintsController do
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  describe 'Front end API' do
    before(:each) { accept_json }

    context 'user does not have read access (no rights) to the backlog' do
      before(:each) do
        @sprint = FactoryGirl.create(:sprint)
        @account_user = FactoryGirl.create(:account_user_with_no_rights, :account => @sprint.backlog.account)
        sign_in @account_user.user
        @params = {
          :backlog_id => @sprint.backlog.id,
          :id => @sprint.id
        }
      end

      it 'should not allow access to criteria index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code_to_string(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to view this backlog'
        end
      end
    end

    context 'user only has read rights to an account' do
      before(:each) do
        @sprint = FactoryGirl.create(:sprint)
        @account_user = FactoryGirl.create(:account_user_with_read_rights, :account => @sprint.backlog.account)
        sign_in @account_user.user
        @params = {
          :backlog_id => @sprint.backlog.id,
          :id => @sprint.id
        }
      end

      it 'should allow access to criteria index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code_to_string(:ok)
        end
      end

      it 'should not allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          response.code.should == status_code_to_string(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should match(/You do not have permission to (create|edit|delete) this (backlog|sprint)/)
        end
      end
    end

    context 'user has full rights to an account' do
      before(:each) do
        @sprint = FactoryGirl.create(:sprint)
        @account_user = FactoryGirl.create(:account_user_with_full_rights, :account => @sprint.backlog.account)
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
          response.code.should == status_code_to_string(:ok)
        end
      end

      it 'should allow a user to create, update, destroy' do
        start_on = Date.today + 2.years
        [:update, :destroy, :create].each do |verb|
          start_on = start_on + 2.days
          post verb, @params.merge(:start_on => start_on)
          [status_code_to_string(:ok),status_code_to_string(:created)].should include(response.code)
        end
      end
    end
  end

  describe 'API' do
    let(:account) { FactoryGirl.create(:account_with_user) }
    let(:user) { account.users.first }
    let(:user_token) { FactoryGirl.create(:user_token, :user => user) }
    let(:backlog) { FactoryGirl.create(:backlog, :account => account) }
    let(:theme) { FactoryGirl.create(:theme, :backlog => backlog) }
    let(:sprint) { FactoryGirl.create(:sprint, :backlog => backlog) }

    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0, :backlog_id => theme.id }
      response.code.should == status_code_to_string(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Sprint does not exist/i)
    end

    def expect_permission_error(http_verb)
      backlog2 = FactoryGirl.create(:backlog, :account => account)
      sprint2 = FactoryGirl.create(:sprint, :backlog => backlog2)
      # assign the user no rights to this backlog
      FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
      get http_verb, { :id => sprint2.id, :backlog_id => backlog2.id }
      response.code.should == status_code_to_string(:forbidden)
    end

    context 'only support JSON and XML' do
      it 'should return a 406 for all unsupported mime types' do
        check_unsupported_mimetypes %w(index show create update destroy), :id, :backlog_id
      end
    end

    context 'index' do
      before(:each) { 2.times { FactoryGirl.create(:sprint_story, :sprint => sprint, :story => FactoryGirl.create(:story, :theme => theme)) } }

      it 'should return a 404 error if the backlog id does not exist' do
        get :index, { :backlog_id => 0 }
        response.code.should == status_code_to_string(:not_found)
      end

      it 'should return an error if the user does not have access to the backlog' do
        get :index, { :backlog_id => FactoryGirl.create(:backlog).id }
        response.code.should == status_code_to_string(:forbidden)
      end

      it 'should return a list of sprints' do
        get :index, { :backlog_id => backlog.id }
        response.code.should == status_code_to_string(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == sprint.id
        json.first['sprint_stories'].should be_blank
      end

      it 'should return a list of sprints with associated data if requested' do
        get :index, { :backlog_id => backlog.id, :include_associated_data => true }
        response.code.should == status_code_to_string(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == sprint.id
        json.first['sprint_stories'].should be_present
        json.first['sprint_stories'].length.should == 2
      end

      it 'should support XML' do
        accept_xml
        get :index, { :backlog_id => backlog.id }
        response.code.should == status_code_to_string(:ok)
        xml = XMLObject.new(response.body)
        xml.sprint.id.to_i.should == sprint.id
      end
    end

    context 'show' do
      before(:each) { 2.times { FactoryGirl.create(:sprint_story, :sprint => sprint, :story => FactoryGirl.create(:story, :theme => theme)) } }

      it 'should return a single sprint' do
        get :show, { :id => sprint.id, :backlog_id => backlog.id }

        response.code.should == status_code_to_string(:ok)
        json = JSON.parse(response.body)
        json['id'].should == sprint.id
        json['iteration'].to_i.should == sprint.iteration
        json.keys.should include('backlog_id','iteration','start_on','number_team_members','duration_days','completed_at','explicit_velocity')
        json.keys.should include('created_at','updated_at')
        json.keys.should_not include('sprint_stories')
      end

      it 'should return all children' do
        get :show, { :id => sprint.id, :backlog_id => backlog.id, :include_associated_data => true }

        response.code.should == status_code_to_string(:ok)
        json = JSON.parse(response.body)
        json['id'].should == sprint.id
        json['sprint_stories'].length.should == 2
      end

      it('should return a 404 error if the id does not exist') { expect_404(:show) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show) }
    end

    context 'create' do
      it 'should allow new sprints to be created' do
        sprint
        backlog.sprints.length.should == 1
        post :create, { :backlog_id => backlog.id, :start_on => sprint.start_on + sprint.duration_days.days, :duration_days => 10, :explicit_velocity => 5 }
        response.code.should == status_code_to_string(:created)
        backlog.reload
        backlog.sprints.length.should == 2
        backlog.sprints.last.duration_days.to_i.should == 10
      end

      it 'should return an error when trying to assign to protected variables' do
        put :create, { :backlog_id => backlog.id, :as_a => 'New name', :some_field => 'assigned' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :create, { :id => sprint.id, :backlog_id => backlog.id, :duration_days => '0' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Duration days/)
      end

      it 'should return an error if one of the fields are invalid based on custom business logic for the sprint' do
        FactoryGirl.create(:sprint, :backlog => backlog, :start_on => Date.today.to_s, :duration_days => 10) # set up a sprint that will be overlapped by the next sprint
        put :create, { :id => sprint.id, :backlog_id => backlog.id, :start_on => Date.today.to_s, :duration_days => 10, :explicit_velocity => 5 }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Start date and duration overlaps with sprint 1/)
      end

      it 'should return an error if the current user does not have permission to create the sprint' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :create, { :backlog_id => backlog.id, :start_on => Date.today.to_s, :duration_days => 10, :explicit_velocity => 5 }
        response.code.should == status_code_to_string(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to create this sprint/)
      end

      it 'should return an error if the backlog is not editable' do
        sprint # create sprint before backlog marked as archived
        backlog.mark_archived
        put :update, { :backlog_id => backlog.id, :duration_days => 10, :id => sprint.id }
        response.code.should == status_code_to_string(:forbidden)
      end
    end

    context 'update' do
      it 'should allow updates' do
        put :update, { :id => sprint.id, :backlog_id => backlog.id, :duration_days => 43 }
        response.code.should == status_code_to_string(:no_content)
        sprint.reload
        sprint.duration_days.should == 43
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => sprint.id, :backlog_id => backlog.id, :some_field => 'assigned' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :update, { :id => sprint.id, :backlog_id => backlog.id, :duration_days => 0 }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Duration days/)
      end

      it 'should return an error if the backlog is not editable' do
        sprint # create sprint before backlog marked as archived
        backlog.mark_archived
        put :update, { :id => sprint.id, :backlog_id => backlog.id, :duration_days => 10 }
        response.code.should == status_code_to_string(:forbidden)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :update, { :id => sprint.id, :backlog_id => backlog.id, :duration_days => 10 }
        response.code.should == status_code_to_string(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to edit this backlog/)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:update) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:update) }
    end

    context 'destroy' do
      it 'should allow a sprint to be deleted' do
        sprint # create sprint
        backlog.sprints.should include(sprint)
        delete :destroy, { :id => sprint.id, :backlog_id => backlog.id }
        response.code.should == status_code_to_string(:no_content)
        backlog.reload
        backlog.sprints.should_not include(sprint)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        delete :destroy, { :id => sprint.id, :backlog_id => backlog.id }
        response.code.should == status_code_to_string(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to delete this sprint/)
      end

      it 'should return a forbidden error if the sprint cannot be deleted because the backlog is locked' do
        sprint # create sprint before backlog marked as archived
        backlog.mark_archived
        delete :destroy, { :id => sprint.id, :backlog_id => backlog.id }
        response.code.should == status_code_to_string(:forbidden)
      end

      it 'should return a forbidden error if the sprint cannot be deleted because the sprint is marked as complete' do
        sprint.mark_as_complete
        delete :destroy, { :id => sprint.id, :backlog_id => backlog.id }
        response.code.should == status_code_to_string(:forbidden)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:destroy) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy) }
    end
  end
end
