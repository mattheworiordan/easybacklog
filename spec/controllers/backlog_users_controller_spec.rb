# encoding: UTF-8

require 'spec_helper'

describe BacklogUsersController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  context 'when updating or viewing privileges' do
    before(:each) do
      @account = Factory.create(:account)
      @backlog = Factory.create(:backlog, :account => @account)
      login_user = Factory.create(:user)
      @account.add_first_user login_user
      sign_in login_user
      @user = Factory.create(:user)
      @account.add_user @user, :read
    end

    it 'should redirect non admin users viewing permissions' do
      sign_in @user
      get :index, :account_id => @account.id, :backlog_id => @backlog.id
      response.should redirect_to(account_path(@account))
    end

    it 'should redirect non admin users updating with HTML' do
      sign_in @user
      put :update, :account_id => @account.id, :backlog_id => @backlog.id, :privilege => 'read', :id => @user.id
      response.should redirect_to(account_path(@account))
    end

    context 'over JSON' do
      before(:each) { accept_json }

      it 'should send a forbidden header if non-admin user' do
        sign_in @user
        put :update, :account_id => @account.id, :backlog_id => @backlog.id, :privilege => 'read', :id => @user.id
        response.code.should == status_code(:forbidden)
      end

      it 'should add a backlog user when explicit permission set' do
        put :update, :account_id => @account.id, :backlog_id => @backlog.id, :privilege => 'read', :id => @user.id
        response.should be_success
        ActiveSupport::JSON.decode(response.body)['message'].should == 'Permissions updated successfully'
        @backlog.reload
        @backlog.backlog_users.first.privilege.should == 'read'
        @backlog.backlog_users.first.user_id.should == @user.id
      end

      it 'should delete a backlog user when (inherit) permission set' do
        @backlog.backlog_users.create! :user_id => @user.id, :privilege => 'read'
        put :update, :account_id => @account.id, :backlog_id => @backlog.id, :privilege => '(inherited)', :id => @user.id
        response.should be_success
        ActiveSupport::JSON.decode(response.body)['message'].should == 'Permissions updated successfully'
        @backlog.reload
        @backlog.backlog_users.should be_blank
      end

      it 'should not allow invalid privileges' do
        put :update, :account_id => @account.id, :backlog_id => @backlog.id, :privilege => 'bollocks', :id => @user.id
        response.code.should == status_code(:invalid_params)
        ActiveSupport::JSON.decode(response.body)['message'].should == 'Invalid parameters'
      end

      it 'should not allow invalid parameters' do
        put :update, :account_id => @account.id, :backlog_id => @backlog.id, :privilege => 'read', :id => 0
        response.code.should == status_code(:invalid_params)
        ActiveSupport::JSON.decode(response.body)['message'].should == 'Invalid parameters'
      end
    end
  end
end