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

    it 'should return a 404 when viewing a backlog in javascript format' do
      get :show, @params.merge(:format => 'js')

      response.code.should == '400'
      json = ActiveSupport::JSON.decode(response.body)
      json.should have_key('status')
      json['status'].should == 'error'
    end

    it 'should return a 404 when viewing a backlog in xml format' do
      get :show, @params.merge(:format => 'xml')

      response.code.should == '400'
      json = Hash.from_xml(response.body)
      json.should have_key('response')
      json['response'].should have_key('status')
      json['response']['status'].should == 'error'
    end

    it 'should redirect user when viewing a snapshot' do
      snapshot = @backlog.create_snapshot('Test snapshot')
      get :show_snapshot, @params.merge(:snapshot_id => snapshot.id)

      flash[:error].should == 'You are not allowed to view this backlog'
      response.should redirect_to(account_path @account)
    end

    it 'should redirect user when viewing a sprint snapshot' do
      @backlog2 = @account.add_example_backlog(@account.users.first)

      get :show_sprint_snapshot, @params.merge(:id => @backlog2.id, :snapshot_id => @backlog2.sprints.first.snapshot.id.to_s)

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

      get :show_sprint_snapshot, @params.merge(:id => @backlog2.id, :snapshot_id => @backlog2.sprints.first.snapshot.id.to_s)

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

      flash[:error].should == 'You do not have permission to duplicate this backlog'
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

      get :show_sprint_snapshot, @params.merge(:id => @backlog2.id, :snapshot_id => @backlog2.sprints.first.snapshot.id.to_s)

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
end