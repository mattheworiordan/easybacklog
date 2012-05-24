# encoding: UTF-8

require 'spec_helper'

describe ApiHelper do
  before(:each) { Rails.cache.clear }

  describe '#api_end_point' do
    it 'should return a valid URL' do
      # silly test, but want to make sure we know if this is broken mistakenly
      helper.api_end_point.should == 'https://api.easybacklog.com/'
    end
  end

  context 'demo api user' do
    it 'should return nil if no demo api user set up' do
      helper.demo_api_user.should be_blank
    end

    it 'should return a demo user if set up' do
      user = Factory.create(:user, :email => 'demo-api@easybacklog.com')
      helper.demo_api_user.should == user
    end
  end

  context 'user does not exist' do
    describe '#demo_api_user_id' do
      it 'should return placeholder' do
        helper.demo_api_user_id.should == '{USER_ID}'
      end
    end
    describe '#demo_api_user_token' do
      it 'should return placeholder' do
        helper.demo_api_user_token.should == '{API_KEY}'
      end
    end
    describe '#demo_api_account_id' do
      it 'should return placeholder' do
        helper.demo_api_account_id.should == '{ACCOUNT_ID}'
      end
    end
    describe '#demo_api_backlog_id' do
      it 'should return placeholder' do
        helper.demo_api_backlog_id.should == '{BACKLOG_ID}'
      end
    end
    describe '#demo_api_snapshot_id' do
      it 'should return placeholder' do
        helper.demo_api_snapshot_id.should == '{SNAPSHOT_ID}'
      end
    end
  end

  context 'user exists without user token' do
    let!(:user) { Factory.create(:user, :email => 'demo-api@easybacklog.com') }

    describe '#demo_api_user_id' do
      it 'should return user id' do
        helper.demo_api_user_id.should == user.id
      end
    end
    describe '#demo_api_user_token' do
      it 'should return placeholder' do
        helper.demo_api_user_token.should == '{API_KEY}'
      end
    end
  end

  context 'user exists with user token' do
    let!(:user) { Factory.create(:user, :email => 'demo-api@easybacklog.com') }
    let!(:demo_api_user_token) { Factory.create(:user_token, :user => user) }
    let!(:account_user) { Factory.create(:account_user, :user => user) }
    let!(:account) { account_user.account }
    let!(:backlog) { Factory.create(:backlog, :account => account) }

    describe '#demo_api_user_id' do
      it 'should return user id' do
        helper.demo_api_user_id.should == user.id
      end
    end
    describe '#demo_api_user_token' do
      it 'should return user token' do
        helper.demo_api_user_token.should == demo_api_user_token.access_token
      end
    end
    describe '#demo_api_account_id' do
      it 'should return account id' do
        helper.demo_api_account_id.should == account.id
      end
    end
    describe '#demo_api_backlog_id' do
      it 'should return backlog id' do
        helper.demo_api_backlog_id.should == backlog.id
      end
    end
    describe '#demo_api_snapshot_id' do
      it 'should return snapshot id' do
        backlog.create_snapshot 'anything'
        helper.demo_api_snapshot_id.should == backlog.snapshots.first.id
      end
    end
  end
end