# encoding: UTF-8

require 'spec_helper'

describe Devise::RegistrationsController do
  let!(:locale) { Factory.create (:locale) }
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  context "new user setting up a new account" do
    it 'should ensure add the example backlog and ensure the user is given explicit permissions to it' do
      # tell Devise which context to use, https://github.com/plataformatec/devise/wiki/How-To%3a-Controllers-and-Views-tests-with-Rails-3-%28and-rspec%29
      @request.env["devise.mapping"] = Devise.mappings[:user]

      post :create, {
        :show_account_setup => 'true',
        :account => {
          :name => 'Acme',
          :locale_id => locale.id
        },
        :user => {
          :name => 'Matt',
          :email => 'matt@test.com',
          :password => 'password',
          :password_confirmation => 'password'
        }
      }

      account = Account.find_by_name('Acme')
      user = User.find_by_email('matt@test.com')

      response.should redirect_to(account_path(account))

      backlog = account.backlogs.first
      backlog.name.should == 'Example corporate website backlog'
      backlog.backlog_users.first.user.should == user
      backlog.backlog_users.first.privilege == 'full'
    end
  end
end