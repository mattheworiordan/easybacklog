# encoding: UTF-8

require 'spec_helper'

describe CompaniesController do
  include Devise::TestHelpers
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  before(:each) do
    @account = Factory.create(:account)
    @company = Factory.create(:company, :account => @account)
    @backlog = Factory.create(:backlog, :company => @company, :account => @account)
    @user = Factory.create(:user)
    sign_in @user
  end

  shared_examples 'a user who can edit companies' do
    it 'should allow the user to edit the company details' do
      get :edit, :account_id => @account.id, :id => @company.id
      response.should be_success
      flash[:error].should be_blank
    end

    it 'should allow the user to update the company details' do
      put :update, :account_id => @account.id, :id => @company.id, :name => 'New name'
      response.should redirect_to(account_path(@account))
      flash[:error].should be_blank
      flash[:notice].should == 'Company defaults were successfully updated'
    end
  end

  context 'where user is an account admin' do
    before(:each) do
      @account.add_first_user @user
    end
    it_behaves_like 'a user who can edit companies'
  end

  context 'where has full access to the company' do
    before(:each) do
      @account.add_user @user, :full
    end
    it_behaves_like 'a user who can edit companies'
  end

  context 'where has read access to the company' do
    before(:each) do
      @account.add_user @user, :read
    end

    it 'should not allow edits' do
      get :edit, :account_id => @account.id, :id => @company.id
      response.should redirect_to(account_path(@account))
      flash[:error].should == 'You do not have permission to edit this company'
    end

    it 'should not allow updates' do
      post :update, :account_id => @account.id, :id => @company.id, :name => 'New name'
      response.should redirect_to(account_path(@account))
      flash[:error].should == 'You do not have permission to edit this company'
    end
  end
end