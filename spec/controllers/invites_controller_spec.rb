# encoding: UTF-8

require 'spec_helper'

describe InvitesController do
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  before(:each) do
    @account = FactoryGirl.create(:account_with_user, :default_velocity => 1, :default_rate => 2, :default_use_50_90 => false)
    @invite = FactoryGirl.create(:invited_user, :account => @account, :invitee_user => @account.users.first)
    @params = {
      :account_id => @account.id,
      :id => @invite.id,
      :security_code => @invite.security_code
    }
  end

  context "Unregistered user follows an invite" do
    it 'should show a registration form with email populated' do
      get :show, @params

      assigns(:user).email.should == @invite.email
      response.should render_template("show")
      session[:after_register_redirect_to].should == request.path
    end
  end

  context "Registered user follows an invite to an account they do not have access to" do
    it 'should assign the user rights to the account with the read rights' do
      @invite.update_attributes! :privilege => 'read'
      signed_in_user = FactoryGirl.create(:user)
      sign_in signed_in_user

      get :show, @params

      response.should render_template("access_granted")
      InvitedUser.exists?(@invite).should be_false
      @account.account_users.find_by_user_id(signed_in_user.id).privilege.should == 'read'
    end
  end

  context "Registered user follows an invite to an account they already have access to and upgrade their privileges" do
    it 'should assign the user rights to the account with the higher of the two privileges' do
      @invite.update_attributes! :privilege => 'full'

      # sign in a user with read rights
      signed_in_user = FactoryGirl.create(:user)
      @account.add_user signed_in_user, :read
      sign_in signed_in_user

      get :show, @params

      response.should render_template('already_have_access')
      InvitedUser.exists?(@invite).should be_false
      @account.account_users.find_by_user_id(signed_in_user.id).privilege.should == 'full'
    end
  end

  context "Registered user follows an invite to an account they already have access to with higher privileges than those offered" do
    it 'should assign the user rights to the account and not downgrade the privileges' do
      @invite.update_attributes! :privilege => 'read'

      # sign in a user with full rights
      signed_in_user = FactoryGirl.create(:user)
      @account.add_user signed_in_user, :full
      sign_in signed_in_user

      get :show, @params

      response.should render_template('already_have_access')
      InvitedUser.exists?(@invite).should be_false
      @account.account_users.find_by_user_id(signed_in_user.id).privilege.should == 'full'
    end
  end

  it "New user should be given explicit full access to the Example backlog" do
    @account.add_example_backlog(@account.users.first)
    @other_backlog = FactoryGirl.create(:backlog, :account => @account)
    # set privileges to none for new user
    @invite.update_attributes! :privilege => 'none'

    # sign in a user with read rights
    signed_in_user = FactoryGirl.create(:user)
    sign_in signed_in_user

    get :show, @params

    response.should render_template("access_granted")

    backlog = @account.backlogs.where(:name => 'Example corporate website backlog').first
    backlog.can?(:full, signed_in_user) == true
    @other_backlog.can?(:full, signed_in_user).should == false
  end
end