# encoding: UTF-8

require 'spec_helper'

describe CompanyUsersController do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  context 'when updating privileges' do
    before(:each) do
      @account = Factory.create(:account)
      @company = Factory.create(:company, :account => @account)
      login_user = Factory.create(:user)
      @account.add_first_user login_user
      sign_in login_user
      @user = Factory.create(:user)
      @account.add_user @user, :read
    end

    it 'should redirect non admin users' do
      sign_in @user
      put :update, :account_id => @account.id, :company_id => @company.id, :privilege => 'read', :id => @user.id
      response.should redirect_to(account_path(@account))
    end

    it 'should add a company user when explicit permission set' do
      put :update, :account_id => @account.id, :company_id => @company.id, :privilege => 'read', :id => @user.id
      response.should be_success
      ActiveSupport::JSON.decode(response.body)['message'].should == 'Permissions updated successfully'
      @company.reload
      @company.company_users.first.privilege.should == 'read'
      @company.company_users.first.user_id.should == @user.id
    end

    it 'should delete a company user when (inherit) permission set' do
      @company.company_users.create! :user_id => @user.id, :privilege => 'read'
      put :update, :account_id => @account.id, :company_id => @company.id, :privilege => '(inherited)', :id => @user.id
      response.should be_success
      ActiveSupport::JSON.decode(response.body)['message'].should == 'Permissions updated successfully'
      @company.reload
      @company.company_users.should be_blank
    end

    it 'should not allow invalid privileges' do
      put :update, :account_id => @account.id, :company_id => @company.id, :privilege => 'bollocks', :id => @user.id
      response.code.should == '400'
      ActiveSupport::JSON.decode(response.body)['message'].should == 'Invalid parameters sent'
    end

    it 'should not allow invalid parameters' do
      put :update, :account_id => @account.id, :company_id => @company.id, :privilege => 'read', :id => 0
      response.code.should == '400'
      ActiveSupport::JSON.decode(response.body)['message'].should == 'Invalid parameters sent'
    end
  end
end