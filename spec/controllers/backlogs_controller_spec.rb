# encoding: UTF-8

require 'spec_helper'

describe BacklogsController do
  include Devise::TestHelpers
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  describe 'Create new backlog with account (has default settings)' do
    before(:each) do
      @account = Factory.create(:account_with_users, :default_velocity => 1, :default_rate => 2, :default_use_50_90 => false)
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
end
