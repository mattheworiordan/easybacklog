# encoding: UTF-8

require 'spec_helper'

describe ThemesController do
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  describe 'Front end API' do
    before(:each) { accept_json }

    context 'user does not have read access (no rights) to the backlog' do
      before(:each) do
        @theme = FactoryGirl.create(:theme)
        @account_user = FactoryGirl.create(:account_user_with_no_rights, :account => @theme.backlog.account)
        sign_in @account_user.user
        @params = {
          :backlog_id => @theme.backlog.id,
          :id => @theme.id
        }
      end

      it 'should not allow access to index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to view this backlog'
        end
      end
    end

    context 'user only has read rights to an account' do
      before(:each) do
        @theme = FactoryGirl.create(:theme)
        @account_user = FactoryGirl.create(:account_user_with_read_rights, :account => @theme.backlog.account)
        sign_in @account_user.user
        @params = {
          :backlog_id => @theme.backlog.id,
          :id => @theme.id
        }
      end

      it 'should allow access to index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should not allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params
          response.code.should == status_code(:forbidden)
          ActiveSupport::JSON.decode(response.body)['message'].should match(/You do not have permission to (create|edit|delete) this (backlog|theme)/)
        end
      end

      it 'should not allow a user to renumber the stories' do
        post :re_number_stories, @params
        response.code.should == status_code(:forbidden)
        ActiveSupport::JSON.decode(response.body)['message'].should == 'You do not have permission to edit this backlog'
      end
    end

    context 'user has full rights to an account' do
      before(:each) do
        @theme = FactoryGirl.create(:theme)
        @account_user = FactoryGirl.create(:account_user_with_full_rights, :account => @theme.backlog.account)
        sign_in @account_user.user
        @params = {
          :backlog_id => @theme.backlog.id,
          :id => @theme.id
        }
      end

      it 'should allow access to index and show' do
        [:index, :show].each do |verb|
          get verb, @params
          response.code.should == status_code(:ok)
        end
      end

      it 'should allow a user to create, update, destroy' do
        [:create, :update, :destroy].each do |verb|
          post verb, @params.merge(:name => "Theme #{verb}")
          response.code.should == status_code(:ok)
        end
      end

      it 'should allow a user to renumber the stories' do
        post :re_number_stories, @params
        response.code.should == status_code(:ok)
      end
    end
  end

  describe 'API' do
    let(:account) { FactoryGirl.create(:account_with_user) }
    let(:user) { account.users.first }
    let(:user_token) { FactoryGirl.create(:user_token, :user => user) }
    let(:backlog) { FactoryGirl.create(:backlog, :account => account) }
    let(:theme) { FactoryGirl.create(:theme, :backlog => backlog) }
    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0, :backlog_id => backlog.id }
      response.code.should == status_code(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Theme does not exist/i)
    end

    def expect_permission_error(http_verb)
      backlog2 = FactoryGirl.create(:backlog, :account => account)
      theme2 = FactoryGirl.create(:theme, :backlog => backlog2)
      # assign the user no rights to this backlog
      FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
      get http_verb, { :id => theme2.id, :backlog_id => backlog2.id }
      response.code.should == status_code(:forbidden)
    end

    context 'only support JSON and XML' do
      it 'should return a 406 for all unsupported mime types' do
        check_unsupported_mimetypes %w(index show create update destroy add_existing_story move_to_backlog), :id, :backlog_id
      end
    end

    context 'index' do
      before(:each) { 2.times { FactoryGirl.create(:story, :theme => theme) } }

      it 'should return a 404 error if the backlog id does not exist' do
        get :index, { :backlog_id => 0 }
        response.code.should == status_code(:not_found)
      end

      it 'should return an error if the user does not have access to the backlog' do
        get :index, { :backlog_id => FactoryGirl.create(:backlog).id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return a list of themes' do
        get :index, { :backlog_id => backlog.id }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == theme.id
        json.first['stories'].should be_blank
      end

      it 'should return a list of themes with associated data if requested' do
        get :index, { :backlog_id => backlog.id, :include_associated_data => true }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json.length.should == 1
        json.first['id'].should == theme.id
        json.first['stories'].should be_present
        json.first['stories'].length.should == 2
      end

      it 'should support XML' do
        accept_xml
        get :index, { :backlog_id => backlog.id }
        response.code.should == status_code(:ok)
        xml = XMLObject.new(response.body)
        xml.theme.id.to_i.should == theme.id
      end
    end

    context 'show' do
      before(:each) { 2.times { FactoryGirl.create(:story, :theme => theme) } }

      it 'should return a single theme' do
        get :show, { :id => theme.id, :backlog_id => backlog.id }

        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == theme.id
        json['name'].should == theme.name
        json.keys.should include('id','backlog_id','name','code','position')
        json.keys.should include('created_at','updated_at')
        json.keys.should_not include('score_statistics')
        json['stories'].should be_blank
      end

      it 'should return all children' do
        get :show, { :id => theme.id, :backlog_id => backlog.id, :include_associated_data => true }

        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == theme.id
        json['stories'].length.should == 2
      end

      it('should return a 404 error if the id does not exist') { expect_404(:show) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show) }
    end

    context 'create' do
      it 'should allow new themes to be created' do
        theme
        backlog.themes.length.should == 1
        post :create, { :backlog_id => backlog.id, :name => 'New name' }
        response.code.should == status_code(:created)
        backlog.reload
        backlog.themes.length.should == 2
        backlog.themes.last.name.should == 'New name'
      end

      it 'should return an error when trying to assign to protected variables' do
        put :create, { :backlog_id => backlog.id, :name => 'New name', :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :create, { :id => theme.id, :backlog_id => backlog.id, :name => '' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Name can't be blank/)
        json['errors'].first.should match(/Name can't be blank/)
      end

      it 'should return an error if the current user does not have permission to create the backlog' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :create, { :backlog_id => backlog.id, :name => 'New name' }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to create this theme/)
      end

      it 'should return an error if the backlog is not editable' do
        backlog.mark_archived
        put :create, { :backlog_id => backlog.id, :name => 'New name' }
        response.code.should == status_code(:forbidden)
      end
    end

    context 'update' do
      it 'should allow updates' do
        put :update, { :id => theme.id, :backlog_id => backlog.id, :name => 'New name' }
        response.code.should == status_code(:no_content)
        theme.reload
        theme.name.should == 'New name'
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => theme.id, :backlog_id => backlog.id, :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :update, { :id => theme.id, :backlog_id => backlog.id, :name => '' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Name can't/)
        json['errors'].first.should match(/Name can't be blank/)
      end

      it 'should return an error if the backlog is not editable' do
        theme # create theme before backlog marked as archived
        backlog.mark_archived
        put :update, { :id => theme.id, :backlog_id => backlog.id, :name => 'New name' }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        put :update, { :id => theme.id, :backlog_id => backlog.id, :name => 'New name' }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to edit this backlog/)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:update) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:update) }
    end

    context 'destroy' do
      it 'should allow a theme to be deleted' do
        theme # create theme
        account.backlogs.available.find_by_id(backlog.id).themes.should be_present
        delete :destroy, { :id => theme.id, :backlog_id => backlog.id }
        response.code.should == status_code(:no_content)
        account.reload
        account.backlogs.available.find_by_id(backlog.id).themes.should be_blank
      end

      it 'should return an error if the current user does not have permission to edit the backlog' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        delete :destroy, { :id => theme.id, :backlog_id => backlog.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should match(/You do not have permission to delete this theme/)
      end

      it 'should return an error if the backlog is not editable' do
        theme # create theme before backlog marked as archived
        backlog.mark_archived
        delete :destroy, { :id => theme.id, :backlog_id => backlog.id }
        response.code.should == status_code(:forbidden)
      end

      it('should return a 404 error if the id does not exist') { expect_404(:destroy) }
      it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy) }
    end

    context 'add story to theme' do
      let(:theme2) { FactoryGirl.create(:theme, :backlog => backlog) }
      let(:story) { FactoryGirl.create(:story, :theme => theme) }

      it 'should allow a story to be moved from another theme' do
        post :add_existing_story, { :id => theme2.id, :backlog_id => backlog.id, :story_id => story.id }
        response.code.should == status_code(:no_content)
        theme2.stories.should include(story)
        theme.reload
        theme.stories.should_not include(story)
      end

      it 'should return an error if the story does not exist' do
        post :add_existing_story, { :id => theme2.id, :backlog_id => backlog.id, :story_id => 0 }
        response.code.should == status_code(:not_found)
      end

      it 'should return an error if the story could not be found from this backlog' do
        post :add_existing_story, { :id => theme2.id, :backlog_id => backlog.id, :story_id => FactoryGirl.create(:story).id }
        response.code.should == status_code(:not_found)
      end
    end

    context 'move theme to another backlog' do
      let(:backlog2) { FactoryGirl.create(:backlog, :account => account) }

      it 'should allow a theme to be moved to another backlog' do
        post :move_to_backlog, { :id => theme.id, :backlog_id => backlog.id, :target_backlog_id => backlog2.id }
        response.code.should == status_code(:no_content)
        backlog.reload
        backlog2.themes.should include(theme)
        backlog.themes.should_not include(theme)
      end

      it 'should return an error if the target backlog could not be found' do
        post :move_to_backlog, { :id => theme.id, :backlog_id => backlog.id, :target_backlog_id => 0 }
        response.code.should == status_code(:not_found)
        json = JSON.parse(response.body)
        json['message'].should match(/The backlog you are moving this theme to does not exist/)
      end

      it 'should return an error if the theme cannot be moved' do
        post :move_to_backlog, { :id => theme.id, :backlog_id => backlog.id, :target_backlog_id => backlog.id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error if the use does not have permission to edit the other backlog' do
        FactoryGirl.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
        post :move_to_backlog, { :id => theme.id, :backlog_id => backlog.id, :target_backlog_id => backlog2.id }
        response.code.should == status_code(:forbidden)
      end
    end
  end
end