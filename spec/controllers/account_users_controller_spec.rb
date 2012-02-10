# encoding: UTF-8

require 'spec_helper'

describe AccountUsersController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  context "Invites" do
    before(:each) do
      @account = Factory.create(:account_with_user, :default_velocity => 1, :default_rate => 2, :default_use_50_90 => false)
      @signed_in_user = @account.users.first
      @account.account_users.first.update_attributes :admin => true
      sign_in @signed_in_user
    end


    it 'should set up a new invite with the correct privileges if user not already invited' do
      params = {
        :account_id => @account.id,
        :privileges => 'read',
        :emails => 'john1@test.com,john2@test.com'
      }
      post :create, params

      flash[:notice].should == "2 people were added to your account."

      @account.users.count.should == 1
      @account.invited_users.count.should == 2
      @account.invited_users.first.email.should == "john1@test.com"
      @account.invited_users.last.email.should == "john2@test.com"
      @account.invited_users.first.privilege.should == Privilege.find(:read)
    end

    it 'should update the privileges if user is already invited' do
      Factory.create(:invited_user, :account => @account, :email => 'john1@test.com', :privilege => 'read')
      params = {
        :account_id => @account.id,
        :privileges => 'full',
        :emails => 'john1@test.com'
      }
      post :create, params

      @account.users.count.should == 1
      @account.invited_users.count.should == 1
      @account.invited_users.first.privilege.should == Privilege.find(:full)
    end

    it 'should update the privileges if user already has access to the account' do
      user = Factory.create(:user, :email => 'john1@test.com')
      @account.add_user user, :read
      @account.account_users.find_by_user_id(user.id).privilege.should == Privilege.find(:read)

      params = {
        :account_id => @account.id,
        :privileges => 'full',
        :emails => 'john1@test.com'
      }
      post :create, params

      @account.users.count.should == 2
      @account.invited_users.count.should == 0
      @account.account_users.find_by_user_id(user.id).privilege.should == Privilege.find(:full)
    end

    it 'should add the user to the account if already registered with a different account' do
      user = Factory.create(:user, :email => 'john1@test.com')

      params = {
        :account_id => @account.id,
        :privileges => 'read',
        :emails => 'john1@test.com'
      }
      post :create, params

      @account.users.count.should == 2
      @account.invited_users.count.should == 0
      @account.account_users.find_by_user_id(user.id).privilege.should == Privilege.find(:read)
    end
  end
end