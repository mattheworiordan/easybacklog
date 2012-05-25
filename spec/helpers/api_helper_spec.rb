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
    describe '#demo_api_company_id' do
      it 'should return placeholder' do
        helper.demo_api_company_id.should == '{COMPANY_ID}'
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
    describe '#demo_api_theme_id' do
      it 'should return placeholder' do
        helper.demo_api_theme_id.should == '{THEME_ID}'
      end
    end
    describe '#demo_api_story_id' do
      it 'should return placeholder' do
        helper.demo_api_story_id.should == '{STORY_ID}'
      end
    end
    describe '#demo_api_acceptance_criterion_id' do
      it 'should return placeholder' do
        helper.demo_api_acceptance_criterion_id.should == '{ACCEPTANCE_CRITERIA_ID}'
      end
    end
    describe '#demo_api_sprint_id' do
      it 'should return placeholder' do
        helper.demo_api_sprint_id.should == '{SPRINT_ID}'
      end
    end
    describe '#demo_api_sprint_story_id' do
      it 'should return placeholder' do
        helper.demo_api_sprint_story_id.should == '{SPRINT_STORY_ID}'
      end
    end
  end

  context 'static lookup data does not exist' do
    describe '#demo_api_locale_id' do
      it 'should return placeholder' do
        helper.demo_api_locale_id.should == '{LOCALE_ID}'
      end
    end
    describe '#demo_api_scoring_rule_id' do
      it 'should return placeholder' do
        helper.demo_api_scoring_rule_id.should == '{SCORING_RULE_ID}'
      end
    end
    describe '#demo_api_sprint_story_status_id' do
      it 'should return placeholder' do
        helper.demo_api_sprint_story_status_id.should == '{SPRINT_STORY_STATUS_ID}'
      end
    end
  end

  context 'static lookup data exists' do
    let!(:locale) { Factory.create(:locale) }
    let!(:scoring_rule) { Factory.create(:scoring_rule) }
    let!(:sprint_story_status) { Factory.create(:sprint_story_status) }

    describe '#demo_api_locale_id' do
      it 'should return placeholder' do
        helper.demo_api_locale_id.should == locale.id
      end
    end
    describe '#demo_api_scoring_rule_id' do
      it 'should return placeholder' do
        helper.demo_api_scoring_rule_id.should == scoring_rule.id
      end
    end
    describe '#demo_api_sprint_story_status_id' do
      it 'should return placeholder' do
        helper.demo_api_sprint_story_status_id.should == sprint_story_status.id
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
    let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
    let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }

    let!(:user) { Factory.create(:user, :email => 'demo-api@easybacklog.com') }
    let!(:demo_api_user_token) { Factory.create(:user_token, :user => user) }
    let!(:account_user) { Factory.create(:account_user, :user => user) }
    let!(:account) { account_user.account }
    let!(:backlog) { Factory.create(:backlog, :account => account) }
    let!(:theme) { Factory.create(:theme, :backlog => backlog) }
    let!(:story) { Factory.create(:story, :theme => theme) }
    let!(:acceptance_criterion) { Factory.create(:acceptance_criterion, :story => story) }
    let!(:company) { Factory.create(:company, :account => account) }
    let!(:sprint) { Factory.create(:sprint, :backlog => backlog) }
    let!(:sprint_story) { Factory.create(:sprint_story, :sprint => sprint, :story => story) }

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
    describe '#demo_api_company_id' do
      it 'should return company id' do
        helper.demo_api_company_id.should == company.id
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
    describe '#demo_api_theme_id' do
      it 'should return theme id' do
        helper.demo_api_theme_id.should == theme.id
      end
    end
    describe '#demo_api_story_id' do
      it 'should return story id' do
        helper.demo_api_story_id.should == story.id
      end
    end
    describe '#demo_api_acceptance_criterion_id' do
      it 'should return criteria id' do
        helper.demo_api_acceptance_criterion_id.should == acceptance_criterion.id
      end
    end
    describe '#demo_api_sprint_id' do
      it 'should return sprint id' do
        helper.demo_api_sprint_id.should == sprint.id
      end
    end
    describe '#demo_api_sprint_story_id' do
      it 'should return sprint story id' do
        helper.demo_api_sprint_story_id.should == sprint_story.id
      end
    end
  end
end