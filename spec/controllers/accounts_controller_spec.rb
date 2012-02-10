# encoding: UTF-8

require 'spec_helper'

describe AccountsController do
  include Devise::TestHelpers
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  before(:each) do
    @account = Factory.create(:account)
    @company = Factory.create(:company, :account => @account)
    @backlog = Factory.create(:backlog, :company => @company, :account => @account)
    @user = Factory.create(:user)
    sign_in @user
  end
end