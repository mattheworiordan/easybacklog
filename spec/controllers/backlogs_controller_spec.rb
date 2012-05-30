# encoding: UTF-8

require 'spec_helper'

describe BacklogsController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  describe 'create new backlog with account (has default settings)' do
    before(:each) do
      @account = Factory.create(:account_with_user, :default_velocity => 1, :default_rate => 2, :default_use_50_90 => false)
      sign_in @account.users.first
    end

    it 'should create a company if specified and name does not exist setting all the backlog settings as defaults' do
      params = {
        :backlog => {
          :name => 'website',
          :velocity => '5',
          :use_50_90 => 'true',
          :rate => '100',
          :has_company => 'true'
        },
        :company_name => 'acme',
        :account_id => @account.id
      }
      post :create, params

      @account.companies.count.should == 1
      company = @account.companies.first
      company.name.should == 'acme'
      company.default_velocity.should == 5
      company.default_use_50_90.should == true
      company.default_rate.should == 100
    end

    it 'should create use the existing company if one exists and not update the default settings' do
      @account.companies.create :name => 'acme', :default_rate => 200, :default_velocity => 10, :default_use_50_90 => false
      params = {
        :backlog => {
          :name => 'website',
          :velocity => '5',
          :use_50_90 => 'true',
          :rate => '100',
          :has_company => 'true'
        },
        :company_name => 'acme',
        :account_id => @account.id
      }
      post :create, params

      @account.companies.count.should == 1
      company = @account.companies.first
      company.name.should == 'acme'
      company.default_velocity.should == 10
      company.default_use_50_90.should == false
      company.default_rate.should == 200
    end

    it 'should be assigned to an account if no company is specified and should not update the account defaults if already set' do
      params = {
        :backlog => {
          :name => 'website',
          :velocity => '5',
          :use_50_90 => 'true',
          :rate => '100'
        },
        :account_id => @account.id
      }
      post :create, params

      @account.companies.count.should == 0
      @account.default_velocity.should == 1
      @account.default_rate.should == 2
      @account.default_use_50_90.should == false
    end

    it 'should be assigned to an account if no company is specified and should update the account defaults if blank' do
      @account.update_attributes! :default_rate => nil, :default_velocity => nil, :default_use_50_90 => nil
      # when updating the attributes defaults_set is fired, so we need to manually override
      @account.update_attribute :defaults_set, false
      params = {
        :backlog => {
          :name => 'website',
          :velocity => '5',
          :use_50_90 => 'true',
          :rate => '100'
        },
        :account_id => @account.id
      }
      post :create, params

      @account.reload
      @account.companies.count.should == 0
      @account.default_velocity.should == 5
      @account.default_rate.should == 100
      @account.default_use_50_90.should == true
    end
  end

  context 'user does not have read access (no rights) to a backlog' do
    before(:each) do
      @account = Factory.create(:account_with_user_with_no_rights)
      @backlog = Factory.create(:backlog, :account => @account)
      @params = {
        :account_id => @account.id,
        :id => @backlog.id
      }
      sign_in @account.users.first
    end

    it 'should redirect user when viewing a backlog' do
      get :show, @params

      flash[:error].should == 'You are not allowed to view this backlog'
      response.should redirect_to(account_path @account)
    end

    it 'should redirect user when viewing a snapshot' do
      snapshot = @backlog.create_snapshot('Test snapshot')
      get :show_snapshot, @params.merge(:snapshot_id => snapshot.id)

      flash[:error].should == 'You are not allowed to view this backlog'
      response.should redirect_to(account_path @account)
    end

    it 'should redirect user when viewing a sprint snapshot' do
      @backlog2 = @account.add_example_backlog(@account.users.first)

      get :show_snapshot, @params.merge(:id => @backlog2.id, :snapshot_id => @backlog2.sprints.first.snapshot.id.to_s)

      flash[:error].should == 'You are not allowed to view this backlog'
      response.should redirect_to(account_path @account)
    end
  end

  context 'User only has read rights to an account' do
    before(:each) do
      @account = Factory.create(:account_with_user_with_read_rights)
      @backlog = Factory.create(:backlog, :account => @account)
      sign_in @account.users.first
      @params = {
        :account_id => @account.id,
        :id => @backlog.id
      }
    end

    it 'should allow a user to view a backlog' do
      get :show, @params

      flash[:error].should be_blank
      response.should_not redirect_to(account_path @account)
    end

    it 'should allow a user to view a snapshot' do
      snapshot = @backlog.create_snapshot('Test snapshot')
      get :show_snapshot, @params.merge(:snapshot_id => snapshot.id)

      flash[:error].should be_blank
      response.should_not redirect_to(account_path @account)
    end

    it 'should allow a user to view a sprint snapshot' do
      @backlog2 = @account.add_example_backlog(@account.users.first)

      get :show_snapshot, @params.merge(:id => @backlog2.id, :snapshot_id => @backlog2.sprints.first.snapshot.id.to_s)

      flash[:error].should be_blank
      response.should_not redirect_to(account_path @account)
    end

    it 'should not allow a user to create backlogs' do
      get :new, @params

      flash[:error].should == 'You do not have permission to create backlogs'
      response.should redirect_to(account_path @account)
    end

    it 'should not allow a user to create backlogs' do
      post :create, @params

      flash[:error].should == 'You do not have permission to create backlogs'
      response.should redirect_to(account_path @account)
    end

    it 'should not allow a user to update backlogs' do
      post :update, @params

      flash[:error].should == 'You do not have permission to update this backlog'
      response.should redirect_to(account_backlog_path @account, @backlog)
    end

    it 'should not allow a user to archive a backlog' do
      post :archive, @params

      flash[:error].should == 'You do not have permission to archive this backlog'
      response.should redirect_to(account_backlog_path @account, @backlog)
    end

    it 'should not allow a user to recover backlog from an archive' do
      @backlog.mark_archived

      post :recover_from_archive, @params

      flash[:error].should == 'You do not have permission to recover this backlog from the archives'
      response.should redirect_to(account_backlog_path @account, @backlog)
    end

    it 'should not allow a user to delete a backlog' do
      delete :destroy, @params

      flash[:error].should == 'You do not have permission to delete this backlog'
      response.should redirect_to(account_backlog_path @account, @backlog)
    end

    it 'should not allow a user to create a snapshot' do
      post :create_snapshot, @params

      flash[:error].should == 'You do not have permission to create a snapshot for this backlog'
      response.should redirect_to(account_backlog_path @account, @backlog)
    end

    it 'should not allow a user to delete a snapshot from a backlog' do
      snapshot = @backlog.create_snapshot('Test snapshot')

      delete :destroy_snapshot, @params.merge(:snapshot_id => snapshot.id)

      flash[:error].should == 'You do not have permission to delete this snapshot'
      response.should redirect_to(account_backlog_path @account, snapshot)
    end

    it 'should not allow a user to duplicate a backlog' do
      post :duplicate, @params

      flash[:error].should == 'You do not have permission to create a new backlog in this account'
      response.should redirect_to(account_backlog_path @account, @backlog)
    end
  end

  context 'user has full rights to an account' do
    before(:each) do
      @account = Factory.create(:account_with_user_with_full_rights)
      @backlog = Factory.create(:backlog, :account => @account)
      sign_in @account.users.first
      @params = {
        :account_id => @account.id,
        :id => @backlog.id
      }
    end

    it 'should allow a user to view a backlog' do
      get :show, @params

      flash[:error].should be_blank
      response.should_not redirect_to(account_path @account)
    end

    it 'should allow a user to view a snapshot' do
      snapshot = @backlog.create_snapshot('Test snapshot')
      get :show_snapshot, @params.merge(:snapshot_id => snapshot.id)

      flash[:error].should be_blank
      response.should_not redirect_to(account_path @account)
    end

    it 'should allow a user to view a sprint snapshot' do
      @backlog2 = @account.add_example_backlog(@account.users.first)

      get :show_snapshot, @params.merge(:id => @backlog2.id, :snapshot_id => @backlog2.sprints.first.snapshot.id.to_s)

      flash[:error].should be_blank
      response.should_not redirect_to(account_path @account)
    end

    it 'should allow a user to create backlogs' do
      get :new, @params

      flash[:error].should be_blank
    end

    it 'should allow a user to create backlogs' do
      post :create, @params

      flash[:error].should_not =~ /You do not have permission to create backlogs/
      response.should_not redirect_to(account_path @account)
    end

    it 'should allow a user to update backlogs' do
      post :update, @params

      flash[:error].should_not =~ /You do not have permission to update this backlog/
    end

    it 'should allow a user to archive a backlog' do
      post :archive, @params

      flash[:error].should be_blank
    end

    it 'should allow a user to recover backlog from an archive' do
      @backlog.mark_archived

      post :recover_from_archive, @params

      flash[:error].should be_blank
    end

    it 'should allow a user to delete a backlog' do
      delete :destroy, @params

      flash[:error].should be_blank
      response.should redirect_to(account_path @account)
    end

    it 'should allow a user to create a snapshot' do
      post :create_snapshot, @params.merge(:name => "test snapshot")

      flash[:error].should be_blank
    end

    it 'should allow a user to delete a snapshot from a backlog' do
      snapshot = @backlog.create_snapshot('Test snapshot')

      delete :destroy_snapshot, @params.merge(:snapshot_id => snapshot.id)

      flash[:error].should be_blank
    end

    it 'should allow a user to duplicate a backlog' do
      post :duplicate, @params

      flash[:error].should be_blank
    end
  end

  context 'new backlog created when account has no defaults set (a new account)' do
    let(:account) { Factory.create(:account_with_user_with_full_rights, :default_velocity => nil, :default_rate => nil) }
    let!(:example_backlog) { account.add_example_backlog(account.users.first) }
    before(:each) { sign_in account.users.first }

    it 'should not update the account settings if backlog is a snapshot' do
      account.defaults_set.should be_blank
      post :create_snapshot, :account_id => account.id, :id => example_backlog.id, :name => 'New snapshot name'
      example_backlog.reload
      example_backlog.snapshots.where(:name => 'New snapshot name').should be_present
      account.reload
      account.defaults_set.should be_blank
    end

    it 'should update the account settings if backlog is created by a user' do
      account.defaults_set.should be_blank
      post :create, :account_id => account.id, :backlog => {
        :name => 'New backlog name', :velocity => 1, :rate => 2 }
      account.reload
      account.backlogs.where(:name => 'New backlog name').should be_present
      account.defaults_set.should be_true
      account.default_velocity.to_i.should == 1
      account.default_rate.to_i.should == 2
    end

    it 'should not update the account settings if account settings already set by user' do
      account.update_attribute :defaults_set, true
      post :create, :account_id => account.id, :backlog => {
        :name => 'New backlog name', :velocity => 1, :rate => 2 }
      account.reload
      account.backlogs.where(:name => 'New backlog name').should be_present
      account.defaults_set.should be_true
      account.default_velocity.should be_blank
      account.default_rate.should be_blank
    end
  end

  describe 'API' do
    let(:account) { Factory.create(:account_with_user) }
    let(:user) { account.users.first }
    let(:user_token) { Factory.create(:user_token, :user => user) }
    let(:backlog) { Factory.create(:backlog, :account => account) }
    before(:each) { setup_api_authentication user_token }

    def check_backlog_data(data_object, backlog)
      data_object.id.to_i.should == backlog.id
      data_object.themes.length.should == 2
      # these string fields are unique fields that are durable across duplication
      data_object.themes[0].name.should == @theme.name
      data_object.themes[0].stories[0].comments.should == @story.comments
    end

    describe 'Master backlogs (not a snapshot)' do
      def expect_404(http_verb)
        get http_verb, { :id => 0, :account_id => account.id }
        response.code.should == status_code(:not_found)
        json = JSON.parse(response.body)
        json['message'].should match(/Backlog does not exist/i)
      end

      def expect_permission_error(http_verb)
        backlog2 = Factory.create(:backlog, :account => account)
        # assign the user no rights to this backlog
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog2)
        get http_verb, { :id => backlog2.id, :account_id => account.id }
        response.code.should == status_code(:forbidden)
      end

      context 'index' do
        it 'should return a 404 error if the account id does not exist' do
          get :index, { :account_id => 0 }
          response.code.should == status_code(:not_found)
        end

        it 'should return an error if the user does not have access to the account' do
          get :index, { :account_id => Factory.create(:account).id }
          response.code.should == status_code(:forbidden)
        end

        it 'should return a list of active backlogs' do
          archived_backlog = Factory.create(:backlog, :archived => true, :account => account)
          backlog_id = backlog.id # force create of the backlog
          get :index, { :account_id => account.id }
          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          json.length.should == 1
          json.first['id'].should == backlog.id
        end

        it 'should include archived backlogs if specified as an option' do
          archived_backlog = Factory.create(:backlog, :archived => true, :account => account)
          backlog_id = backlog.id # force create of the backlog
          get :index, { :account_id => account.id, :include_archived => true }
          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          json.length.should == 2
          [json.first['id'], json.second['id']].should include(backlog.id, archived_backlog.id)
        end
      end

      context 'show' do
        render_views # we need the XML builder view to actually execute and not be stubbed by RSpec/Rails

        # create 2 of each as XmlObject does not recognise elements with only one child
        def create_backlog_data
          @theme = Factory.create(:theme, :backlog => backlog)
          Factory.create(:theme, :backlog => backlog)
          @story = Factory.create(:story, :theme => @theme)
          Factory.create(:story, :theme => @theme)
          @criterion = Factory.create(:acceptance_criterion, :story => @story)
          Factory.create(:acceptance_criterion, :story => @story)
          @sprint = Factory.create(:sprint, :backlog => backlog)
          Factory.create(:sprint, :backlog => backlog)
        end

        it 'should allow an API user to GET a backlog' do
          get :show, { :id => backlog.id, :account_id => account.id }

          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          json['id'].should == backlog.id
          json['name'].should == backlog.name
          json.keys.should include('last_modified_user_id','created_at','updated_at')
          json.keys.should include('account_id','author_id','company_id','velocity','rate','archived','use_50_90','scoring_rule_id')
          json.keys.should_not include('snapshot_master_id','deleted','snapshot_for_sprint_id')
        end

        it('should return a 404 error if the backlog id does not exist') { expect_404(:show) }
        it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show) }

        it 'should provide all associated JSON data to this backlog if requested' do
          create_backlog_data

          get :show, { :id => backlog.id, :account_id => account.id, :include_associated_data => true }
          response.code.should == status_code(:ok)
          data = RecursiveOpenStruct.new(JSON.parse(response.body))
          check_backlog_data data, backlog
          data.themes[0].stories[0].acceptance_criteria[0].criterion.should == @criterion.criterion
          data.sprints[0].iteration.to_i.should == @sprint.iteration
        end

        it 'should provide all associated XML data including snapshots to this backlog if requested' do
          create_backlog_data
          backlog.create_snapshot 'Manual snapshot'
          backlog.create_snapshot 'Manual snapshot 2' # must create 2 as XMLObject does not support iteration of nodes with single children
          backlog.sprints.first.create_snapshot_if_missing

          accept_xml
          get :show, { :id => backlog.id, :account_id => account.id, :include_associated_data => true }
          response.code.should == status_code(:ok)
          xml = XMLObject.new(response.body)
          check_backlog_data xml, backlog
          xml.sprints[0].iteration.to_i.should == @sprint.iteration
          xml.snapshots.length.should == backlog.snapshots.length
        end
      end

      context 'create' do
        it 'should allow backlogs to be created' do
          put :create, { :account_id => account.id, :name => 'New name' }
          response.code.should == status_code(:created)
          account.reload
          account.backlogs.last.name.should == 'New name'
          json = JSON.parse(response.body)
          json['name'].should == 'New name'
        end

        it 'should return an error when trying to assign to protected variables' do
          put :create, { :account_id => account.id, :some_field => 'assigned' }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/You cannot assign/)
          json['message'].should match(/some_field/)
        end

        it 'should return an error if the fields are not valid' do
          put :create, { :account_id => account.id, :name => '' }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/Name can't/)
        end

        it 'should return an error when assigning rate without velocity' do
          post :create, { :account_id => account.id, :name => 'New name', :rate => 500 }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/Rate cannot be specified if velocity is empty/)
        end

        it 'should return an error if the current user does not have permission to create the backlog' do
          no_rights_account_user = Factory.create(:account_user_with_no_rights, :account => account)
          setup_api_authentication Factory.create(:user_token, :user => no_rights_account_user.user)
          put :create, { :account_id => account.id, :name => 'New name' }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You do not have permission to create backlogs/)
        end
      end

      context 'update' do
        it 'should allow updates to a backlog' do
          put :update, { :id => backlog.id, :account_id => account.id, :name => 'New name' }
          response.code.should == status_code(:no_content)
          backlog.reload
          backlog.name.should == 'New name'
        end

        it 'should return an error when trying to assign to protected variables' do
          put :update, { :id => backlog.id, :account_id => account.id, :some_field => 'assigned' }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/You cannot assign/)
          json['message'].should match(/some_field/)
        end

        it 'should return an error if the fields are not valid' do
          put :update, { :id => backlog.id, :account_id => account.id, :name => '' }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/Name can't/)
          json['errors'].first.should match(/Name can't/)
        end

        it 'should return an error when assigning default_rate without default_velocity' do
          put :update, {:id => backlog.id, :account_id => account.id, :rate => 500, :velocity => nil }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/Rate cannot be specified if velocity is empty/)
        end

        it 'should return an error if the backlog is not editable' do
          backlog.mark_archived
          put :update, { :id => backlog.id, :account_id => account.id, :name => 'New name' }
          response.code.should == status_code(:forbidden)
        end

        it 'should return an error if the current user does not have permission to edit the backlog' do
          Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
          put :update, { :id => backlog.id, :account_id => account.id, :name => 'New name' }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You do not have permission to update this backlog/)
        end

        it 'should allow a backlog to be archived and all other fields will be updated as well' do
          put :update, { :id => backlog.id, :account_id => account.id, :name => 'New name', :archived => 'true' }
          response.code.should == status_code(:no_content)
          backlog.reload
          backlog.archived.should be_true
          backlog.name.should == 'New name'
        end

        it 'should allow an archived backlog to be restored from archive and all other fields will be ignored' do
          backlog.mark_archived
          put :update, { :id => backlog.id, :account_id => account.id, :name => 'New name', :archived => 'false' }
          response.code.should == status_code(:no_content)
          backlog.reload
          backlog.archived.should be_false
          backlog.name.should_not == 'New name'
        end

        it('should return a 404 error if the backlog id does not exist') { expect_404(:update) }
        it('should return an error if the user does not have access to the backlog') { expect_permission_error(:update) }
      end

      context 'destroy' do
        it 'should allow a backlog to be deleted' do
          delete :destroy, { :id => backlog.id, :account_id => account.id }
          response.code.should == status_code(:no_content)
          account.reload
          account.backlogs.available.find_by_id(backlog.id).should be_blank
        end

        it 'should return an error if the current user does not have permission to edit the backlog' do
          Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
          delete :destroy, { :id => backlog.id, :account_id => account.id }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You do not have permission to delete this backlog/)
        end

        it('should return a 404 error if the backlog id does not exist') { expect_404(:destroy) }
        it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy) }
      end

      context 'duplicate' do
        it 'should allow a backlog to be duplicated' do
          post :duplicate, { :id => backlog.id, :account_id => account.id, :name => 'Duplicate backlog' }
          response.code.should == status_code(:created)
          account.reload
          new_backlog = account.backlogs.available.find_by_name('Duplicate backlog')
          new_backlog.should be_present
          json = JSON.parse(response.body)
          json['id'].should == new_backlog.id
        end

        it 'should return an error if the current user does not have permission to create a new backlog' do
          account.account_users.each { |au| au.privilege = Privilege.new(:read); au.save! }
          post :duplicate, { :id => backlog.id, :account_id => account.id, :name => 'Duplicate backlog' }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You do not have permission to create a new backlog in this account/)
        end

        it 'should return an error if updating with invalid details' do
          post :duplicate, { :id => backlog.id, :account_id => account.id, :name => '' }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/Name can't/)
        end

        it('should return a 404 error if the backlog id does not exist') { expect_404(:duplicate) }
        it('should return an error if the user does not have access to the backlog') { expect_permission_error(:duplicate) }
      end
    end

    describe 'Backlog snapshots' do
      let(:manual_snapshot) { backlog.create_snapshot 'Manual' }
      let(:sprint) { Factory.create(:sprint, :backlog => backlog) }
      let(:sprint_snapshot) { sprint.create_snapshot_if_missing }

      def expect_404(http_verb)
        get http_verb, { :id => backlog.id, :account_id => account.id, :snapshot_id => 0 }
        response.code.should == status_code(:not_found)
        json = JSON.parse(response.body)
        json['message'].should match(/Snapshot does not exist/i)
      end

      def expect_permission_error(http_verb)
        # assign the user no rights to this backlog
        Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
        get http_verb, { :id => backlog.id, :account_id => account.id, :snapshot_id => manual_snapshot.id }
        response.code.should == status_code(:forbidden)
      end

      context 'index' do
        it 'should return a 404 error if the account id does not exist' do
          get :index_snapshot, { :account_id => 0 }
          response.code.should == status_code(:not_found)
        end

        it 'should return an error if the user does not have access to the account' do
          get :index_snapshot, { :account_id => Factory.create(:account).id }
          response.code.should == status_code(:forbidden)
        end

        it 'should return a 404 error if the backlog id does not exist' do
          get :index_snapshot, { :account_id => account.id, :id => 0 }
          response.code.should == status_code(:not_found)
        end

        it 'should return an error if the user does not have access to the backlog' do
          get :index_snapshot, { :account_id => Factory.create(:account).id }
          response.code.should == status_code(:forbidden)
        end

        it 'should return a list of snapshots' do
          manual_snapshot
          sprint_snapshot
          get :index_snapshot, { :account_id => account.id, :id => backlog.id }
          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          json['manual_snapshots'].length.should == 1
          json['manual_snapshots'].first['id'].should == manual_snapshot.id
          json['sprint_snapshots'].length.should == 1
          json['sprint_snapshots'].first['id'].should == sprint_snapshot.id
        end
      end

      context 'create' do
        it 'should allow snapshots to be created' do
          put :create_snapshot, { :account_id => account.id, :id => backlog.id, :name => 'New name' }
          response.code.should == status_code(:created)
          account.reload
          account.backlogs.last.snapshots.last.name.should == 'New name'
          json = JSON.parse(response.body)
          json['name'].should == 'New name'
        end

        it 'should return an error if the fields are not valid' do
          put :create_snapshot, { :account_id => account.id, :id => backlog.id, :name => '' }
          response.code.should == status_code(:invalid_params)
          json = JSON.parse(response.body)
          json['message'].should match(/Name can't/)
        end

        it 'should return an error if the current user does not have permission to create the backlog' do
          no_rights_account_user = Factory.create(:account_user_with_no_rights, :account => account)
          setup_api_authentication Factory.create(:user_token, :user => no_rights_account_user.user)
          put :create_snapshot, { :account_id => account.id, :id => backlog.id, :name => 'New name' }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You do not have permission to create a snapshot/)
        end
      end

      context 'show' do
        render_views # we need the XML builder view to actually execute and not be stubbed by RSpec/Rails

        # create 2 of each as XmlObject does not recognise elements with only one child
        def create_backlog_data_and_snapshots
          @theme = Factory.create(:theme, :backlog => backlog)
          Factory.create(:theme, :backlog => backlog)
          @story = Factory.create(:story, :theme => @theme)
          Factory.create(:story, :theme => @theme)
          @criterion = Factory.create(:acceptance_criterion, :story => @story)
          Factory.create(:acceptance_criterion, :story => @story)
          @sprint = Factory.create(:sprint, :backlog => backlog)
          Factory.create(:sprint, :backlog => backlog)
          manual_snapshot
          sprint_snapshot
        end

        it 'should return the snapshot JSON data for a manual snapshot' do
          get :show_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => manual_snapshot.id }

          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          json['id'].should == manual_snapshot.id
          json['name'].should == 'Manual'
          json.keys.should include('id', 'velocity','rate','use_50_90','scoring_rule_id')
          json.keys.should_not include('snapshot_master_id','deleted','snapshot_for_sprint_id')
        end

        it 'should return the snapshot JSON data for a sprint snapshot' do
          get :show_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => sprint_snapshot.id }

          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          json['id'].should == sprint_snapshot.id
          json['name'].should == 'Sprint 1'
          json.keys.should include('id', 'velocity','rate','use_50_90','scoring_rule_id')
          json.keys.should_not include('snapshot_master_id','deleted','snapshot_for_sprint_id')
        end

        it('should return a 404 error if the snapshot id does not exist') { expect_404(:show_snapshot) }
        it('should return an error if the user does not have access to the backlog') { expect_permission_error(:show_snapshot) }

        it 'should provide all associated JSON data to this snapshot if requested' do
          create_backlog_data_and_snapshots

          get :show_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => manual_snapshot.id, :include_associated_data => true }
          response.code.should == status_code(:ok)
          json = JSON.parse(response.body)
          data = RecursiveOpenStruct.new(json)
          check_backlog_data data, manual_snapshot
          data.themes[0].stories[0].acceptance_criteria[0].criterion.should == @criterion.criterion
        end

        it 'should provide all associated XML data if requested' do
          create_backlog_data_and_snapshots

          accept_xml
          get :show_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => manual_snapshot.id, :include_associated_data => true }
          response.code.should == status_code(:ok)
          xml = XMLObject.new(response.body)
          check_backlog_data xml, manual_snapshot
        end
      end

      context 'destroy' do
        it 'should allow a manual backlog to be deleted' do
          delete :destroy_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => manual_snapshot.id }
          response.code.should == status_code(:no_content)
          backlog.reload
          backlog.snapshots.length.should == 0
        end

        it 'should return an error if the current user does not have permission to edit the backlog' do
          Factory.create(:backlog_user_with_no_rights, :user => user, :backlog => backlog)
          delete :destroy_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => manual_snapshot.id }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You do not have permission to delete this snapshot/)
        end

        it 'should show a useful error message if a user tries to delete a sprint snapshot' do
          delete :destroy_snapshot, { :id => backlog.id, :account_id => account.id, :snapshot_id => sprint_snapshot.id }
          response.code.should == status_code(:forbidden)
          json = JSON.parse(response.body)
          json['message'].should match(/You cannot delete a sprint snapshot, only manually created snapshots can be deleted/)
        end

        it('should return a 404 error if the backlog id does not exist') { expect_404(:destroy_snapshot) }
        it('should return an error if the user does not have access to the backlog') { expect_permission_error(:destroy_snapshot) }
      end
    end
  end
end