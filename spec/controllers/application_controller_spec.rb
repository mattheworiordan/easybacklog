# encoding: UTF-8

require 'spec_helper'

class TestingApplicationController < ApplicationController
  before_filter :authenticate_user!
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api, :if => :is_api?
  def show
    render :nothing => true, :status => STATUS_CODE[:ok]
  end
end

# testing this controller
describe TestingApplicationController do
  # but it has no actual public methods as it's inherited from for other controllers, so lets add that and set authentication required
  describe 'API authentication' do
    let(:account) { FactoryGirl.create(:account_with_user) }
    let(:user) { account.users.first }
    let(:user_token) { FactoryGirl.create(:user_token, :user => user) }

    it 'should allow an API request to authenticate using basic authentication' do
      request.env['X-Forward-To-API'] = 'true'
      request.env['HTTP_AUTHORIZATION'] = "Basic #{Base64::encode64("#{user_token.user.id}:#{user_token.access_token}")}"

      get :show, { :id => account.id }
      response.code.should == status_code(:ok)
    end

    it 'should fail an API request trying to authenticate using basic authentication and invalid details' do
      request.env['X-Forward-To-API'] = 'true'
      request.env['HTTP_AUTHORIZATION'] = "Basic matt:password}"

      get :show, { :id => account.id }
      response.code.should == status_code(:unauthorized)
      json = JSON.parse(response.body)
      json['status'].should == 'error'
      json['message'].should == 'Invalid authentication details'
    end

    it 'should allow an API request to authenticate using token authentication (auth header)' do
      request.env['X-Forward-To-API'] = 'true'
      request.env['HTTP_AUTHORIZATION'] = "token #{user_token.access_token}"

      get :show, { :id => account.id }
      response.code.should == status_code(:ok)
    end

    it 'should fail an API request trying to authenticate using token authentication (auth header) and invalid details' do
      request.env['X-Forward-To-API'] = 'true'
      request.env['HTTP_AUTHORIZATION'] = "token IveJustMadeThisUp"

      get :show, { :id => account.id }
      response.code.should == status_code(:unauthorized)
    end

    it 'should allow an API request to authenticate using querystring authentication' do
      request.env['X-Forward-To-API'] = 'true'

      get :show, { :id => account.id, :api_key => user_token.access_token }
      response.code.should == status_code(:ok)
    end

    it 'should fail an API request trying to authenticate using querystring authentication' do
      request.env['X-Forward-To-API'] = 'true'

      get :show, { :id => account.id, :api_key => 'doesNotExist' }
      response.code.should == status_code(:unauthorized)
    end

    it 'should fail an API request without any form of authentication in the request' do
      request.env['X-Forward-To-API'] = 'true'

      get :show, { :id => account.id }
      response.code.should == status_code(:unauthorized)
    end

    describe 'ssl' do
      before(:each) { controller.stub(:dev_test?) { false } }
      after(:each) { controller.unstub(:dev_test?) }

      it 'should fail if accessing the API over plain text' do
        request.env['X-Forward-To-API'] = 'true'
        request.env['HTTP_AUTHORIZATION'] = "token #{user_token.access_token}"

        get :show, { :id => account.id }
        response.code.should == status_code(:upgrade_required)
      end
    end

    describe 'API supported formats' do
      render_views # we need to test the error template is rendering correctly

      it 'should show an error if trying to request HTML' do
        request.env['X-Forward-To-API'] = 'true'
        request.env['HTTP_AUTHORIZATION'] = "Basic #{Base64::encode64("#{user_token.user.id}:#{user_token.access_token}")}"
        request.env['HTTP_ACCEPT'] = 'text/html'

        get :show, { :id => account.id }
        response.code.should == status_code(:not_acceptable)
        response.body.should match(/HTML is not a supported/)
      end

      it 'should show an error if trying to request unsupported formats' do
        request.env['X-Forward-To-API'] = 'true'
        request.env['HTTP_AUTHORIZATION'] = "Basic #{Base64::encode64("#{user_token.user.id}:#{user_token.access_token}")}"
        request.env['HTTP_ACCEPT'] = 'text/plain'

        get :show, { :id => account.id }
        response.code.should == status_code(:not_acceptable)
      end
    end
  end
end