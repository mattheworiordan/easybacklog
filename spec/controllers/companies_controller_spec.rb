# encoding: UTF-8

require 'spec_helper'

describe CompaniesController do
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }

  describe 'front end' do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @company = FactoryGirl.create(:company, :account => @account)
      @backlog = FactoryGirl.create(:backlog, :company => @company, :account => @account)
      @user = FactoryGirl.create(:user)
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

  describe 'API' do
    let(:company) { FactoryGirl.create(:company) }
    let(:account) { company.account }
    let(:user) { FactoryGirl.create(:account_user_with_full_rights, :account => account).user }
    let(:user_token) { FactoryGirl.create(:user_token, :user => user) }
    before(:each) { setup_api_authentication user_token }

    def expect_404(http_verb)
      get http_verb, { :id => 0, :account_id => account.id }
      response.code.should == status_code_to_string(:not_found)
      json = JSON.parse(response.body)
      json['message'].should match(/Company does not exist/i)
    end

    context 'only support JSON and XML' do
      it 'should return a 406 for all unsupported mime types' do
        check_unsupported_mimetypes %w(index show create update), :id, :account_id
      end
    end

    context 'index' do
      let! (:company2) { FactoryGirl.create(:company, :account => account) }
      before (:each) { FactoryGirl.create(:company_user, :user => user, :company => company2) }

      def check_has_valid_companies_data(companies)
        response.code.should == status_code_to_string(:ok)
        companies.length.should == 2
        [companies.first['id'].to_i,companies.second['id'].to_i].should include(company.id,company2.id)
      end

      it 'should return a JSON list of Companies' do
        get :index, { :account_id => account.id }
        json = JSON.parse(response.body)
        check_has_valid_companies_data(json)
      end

      it 'should return an XML list of Companies' do
        accept_xml
        get :index, { :account_id => account.id }
        response.code.should == status_code_to_string(:ok)
        xml = XMLObject.new(response.body)
        check_has_valid_companies_data(xml.companies)
      end
    end

    context 'show' do
      it 'should return the JSON for a company that exists that the user has access to' do
        get :show, { :id => company.id, :account_id => account.id }
        response.code.should == status_code_to_string(:ok)
        json = JSON.parse(response.body)
        json['id'].should == company.id
        json['name'].should == company.name
      end

      it 'should return a 404 error if trying to access another user\'s company' do
        company2 = FactoryGirl.create(:company)
        get :show, { :id => company2.id, :account_id => account.id }
        response.code.should == status_code_to_string(:not_found)
      end

      it 'should return a 404 if trying to access a company that does not exist' do
        get :show, { :id => 0, :account_id => account.id }
        response.code.should == status_code_to_string(:not_found)
      end

      it('should return a 404 error if the account id does not exist') { expect_404(:show) }
    end

    context 'create' do
      let(:new_locale) { FactoryGirl.create(:locale) }

      it 'should allow users to create a company' do
        post :create, { :account_id => account.id, :name => 'New name', :default_velocity => 27, :default_rate => 800 }
        response.code.should == status_code_to_string(:created)
        json = JSON.parse(response.body)
        json['name'].should == 'New name'
        json['default_velocity'].to_i.should == 27
        company = Company.find(json['id'])
        company.name.should == 'New name'
        company.default_velocity.to_i.should == 27
        company.default_rate.to_i.should == 800
      end

      it 'should return an error when trying to assign to protected variables' do
        post :create, { :account_id => account.id, :name => 'New name', :some_field => 'assigned' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/some_field/)
      end

      it 'should return an error when assigning default_rate without default_velocity' do
        post :create, { :account_id => account.id, :name => 'New name', :default_rate => 500 }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Default rate cannot be specified if default velocity is empty/)
        json['errors'].first.should match(/Default rate cannot be specified if default velocity is empty/)
      end

      it 'should return an error if the fields are not valid' do
        post :create, { :account_id => account.id, :name => '' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Name can't/)
      end

      it 'should return an error if the user does not have full access to the account' do
        account_user2 = FactoryGirl.create(:account_user_with_no_rights)
        user_token2 = FactoryGirl.create(:user_token, :user => account_user2.user)
        setup_api_authentication user_token2
        post :create, { :account_id => account_user2.account.id, :name => 'New name' }
        response.code.should == status_code_to_string(:forbidden)
      end
    end

    context 'update' do
      let(:new_locale) { FactoryGirl.create(:locale) }

      it 'should allow updates to a company' do
        put :update, { :id => company.id, :account_id => account.id, :name => 'New name', :default_velocity => 27 }
        response.code.should == status_code_to_string(:no_content)
        company.reload
        company.name.should == 'New name'
        company.default_velocity.to_i.should == 27
      end

      it 'should return an error when trying to assign to protected variables' do
        put :update, { :id => company.id, :account_id => account.id, :name => 'New name', :some_field => 'assigned' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/You cannot assign/)
        json['message'].should match(/some_field/)
      end

      it 'should return an error when assigning default_rate without default_velocity' do
        put :update, {:id => company.id, :account_id => account.id, :default_rate => 500, :default_velocity => nil }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Default rate cannot be specified if default velocity is empty/)
        json['errors'].first.should match(/Default rate cannot be specified if default velocity is empty/)
      end

      it 'should return an error if the fields are not valid' do
        put :update, { :id => company.id, :account_id => account.id, :name => '' }
        response.code.should == status_code_to_string(:invalid_params)
        json = JSON.parse(response.body)
        json['message'].should match(/Name can't/)
      end

      it 'should return an error if the user does not have full access to the account' do
        account_user2 = FactoryGirl.create(:account_user_with_no_rights)
        user_token2 = FactoryGirl.create(:user_token, :user => account_user2.user)
        company2 = FactoryGirl.create(:company, :account => account_user2.account)
        setup_api_authentication user_token2
        put :update, { :id => company2.id, :account_id => account_user2.account.id }
        response.code.should == status_code_to_string(:forbidden)
      end

      it('should return a 404 error if the account id does not exist') { expect_404(:update) }
    end
  end
end