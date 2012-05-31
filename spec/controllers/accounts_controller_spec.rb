# encoding: UTF-8

require 'spec_helper'

describe AccountsController do
  let(:account) { FactoryGirl.create(:account_with_user) }
  let(:user) { account.users.first }
  let(:user_token) { FactoryGirl.create(:user_token, :user => user) }

  describe 'URL error handling' do
    before(:each) { sign_in user }

    it 'should return a 404 if trying to access an account that does not exist' do
      get :show, { :id => 0 }
      response.code.should == status_code(:not_found)
    end

    it 'should flash an error if trying to access another user\'s account' do
      account2 = FactoryGirl.create(:account_with_user)
      get :show, { :id => account2.id }
      response.should redirect_to(accounts_path)
      flash[:error].should == 'You do not have permission to view this account'
    end
  end

  describe 'API' do
    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0 }
      response.code.should == status_code(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Account does not exist/i)
    end

    context 'only support JSON and XML' do
      it 'should return a 406 for all unsupported mime types' do
        check_unsupported_mimetypes %w(index show update)
      end
    end

    context 'index' do
      let (:account2) { FactoryGirl.create(:account) }
      before (:each) { FactoryGirl.create(:account_user, :user => user, :account => account2) }

      def check_has_valid_accounts_data(accounts)
        response.code.should == status_code(:ok)
        accounts.length.should == 2
        [accounts.first['id'].to_i,accounts.second['id'].to_i].should include(account.id,account2.id)
      end

      it 'should return a JSON list of Accounts' do
        get :index
        json = JSON.parse(response.body)
        check_has_valid_accounts_data(json)
      end

      it 'should return an XML list of Accounts' do
        accept_xml
        get :index
        response.code.should == status_code(:ok)
        xml = XMLObject.new(response.body)
        check_has_valid_accounts_data(xml.accounts)
      end
    end

    context 'show' do
      it 'should return the JSON for an account that exists that the user has access to' do
        get :show, { :id => account.id }
        response.code.should == status_code(:ok)
        json = JSON.parse(response.body)
        json['id'].should == account.id
        json['name'].should == account.name
      end

      it 'should return an error if trying to access another user\'s account' do
        account2 = FactoryGirl.create(:account_with_user)
        get :show, { :id => account2.id }
        response.code.should == status_code(:forbidden)
        json = JSON.parse(response.body)
        json['message'].should == 'You do not have permission to view this account'
      end

      it 'should return a 404 if trying to access an account that does not exist' do
        get :show, { :id => 0 }
        response.code.should == status_code(:not_found)
      end

      it('should return a 404 error if the account id does not exist') { expect_404(:show) }
    end

    context 'update' do
      let(:new_locale) { FactoryGirl.create(:locale) }

      it 'should allow updates to an account' do
        put :update, { :id => account.id, :name => 'New name', :locale_id => new_locale }
        response.code.should == status_code(:no_content)
        account.reload
        account.name.should == 'New name'
        account.locale_id.should == new_locale.id
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => account.id, :name => 'New name', :some_field => 'assigned' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error if the fields are not valid' do
        put :update, { :id => account.id, :name => '' }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Name can't/)
        json['errors'].first.should match(/Name can't/)
      end

      it 'should return an error if the user does not have full permissions' do
        account_user2 = FactoryGirl.create(:account_user_with_no_rights)
        user_token2 = FactoryGirl.create(:user_token, :user => account_user2.user)
        setup_api_authentication user_token2
        put :update, { :id => account_user2.account.id }
        response.code.should == status_code(:forbidden)
      end

      it 'should return an error when assigning default_rate without default_velocity' do
        put :update, {:id => account.id, :default_rate => 500, :default_velocity => nil }
        response.code.should == status_code(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Default rate cannot be specified if default velocity is empty/)
        json['errors'].first.should match(/Default rate cannot be specified/)
      end

      it('should return a 404 error if the account id does not exist') { expect_404(:update) }
    end
  end
end