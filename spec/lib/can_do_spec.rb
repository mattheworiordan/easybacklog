# encoding: UTF-8

require 'spec_helper'

describe 'Can Do Module' do
  # the changes we make to the account, backlog and company classes effect other tests so lets ensure we restore the classes back to their original state
  before(:all) do
    @class_state = {}
    [Account,Backlog,Company].each do |cls|
      @class_state[cls] = {
        :privileges => cls.privileges,
        :inherited_privilege => cls.inherited_privilege
      }
    end
  end

  # restore class state so that this test does not have side effects on other tests
  after(:all) do
    [Account,Backlog,Company].each do |cls|
      cls.privileges = @class_state[cls][:privileges]
      cls.inherited_privilege = @class_state[cls][:inherited_privilege]
    end
  end

  context 'Class methods' do
    it 'should create provide a class method can_do' do
      class AccountTest < ActiveRecord::Base
        self.table_name = 'accounts'
      end
      account = AccountTest.new
      account.class.respond_to?(:can_do).should be_true
    end
  end

  context 'instance methods for an object without inherited parent privileges' do
    before (:each) do
      @account = Factory.create(:account)
      @account.class.can_do :privileges => :account_users # force re-initialise so we don't depend on Account specification
    end

    it 'should provide appropriate responses to can? method for a regular user with read rights' do
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @account.can?(:read, @account_user.user).should be_true
      @account.can?(:full, @account_user.user).should be_false
    end

    it 'should provide appropriate responses to cannot? method for a regular user with read rights' do
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @account.cannot?(:read, @account_user.user).should be_false
      @account.cannot?(:full, @account_user.user).should be_true
    end

    it 'should raise an exception when authorize! is called for a regular user with read rights' do
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @account.authorize!(:read, @account_user.user)
      expect { @account.authorize!(:full, @account_user.user) }.to raise_exception CanDo::AuthenticationError
    end

    it 'should provide yes responses to all can? methods for a user with admin rights' do
      @account_user = Factory.create(:account_user_with_account_admin_rights, :account => @account)
      @account.can?(:read, @account_user.user).should be_true
      @account.can?(:full, @account_user.user).should be_true
    end

    it 'should respond with false for all can? queries when user has no rights' do
      user = Factory.create(:user)
      @account.can?(:read, user).should be_false
      @account.can?(:full, user).should be_false
    end

    it 'should respond with false for all can? queries when user has nil (inherited) rights' do
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @account_user.update_attributes :privilege => nil
      @account.reload
      @account.can?(:read, @account_user.user).should be_false
      @account.can?(:full, @account_user.user).should be_false
    end
  end

  # contrived example as account would not inherit from another account, but works for the purposes of this test
  context 'instance methods for an object with inherited parent privileges' do
    before (:each) do
      @account = Factory.create(:account)
      @account.class.can_do :privileges => :account_users, :inherited_privilege => :parent_account # force re-initialise so we don't depend on Account specification
      @account.stub(:parent_account ) { @account_parent } # set up reference to @account_parent for psuedo method parent_account

      # create a new class based on Account that does not share the same class methods and properties as Account as CanDo uses class properties
      class AccountParent < ActiveRecord::Base
        self.table_name = 'accounts'
        can_do :privileges => :account_users
        has_many :account_users, :dependent => :destroy, :foreign_key => 'account_id'
      end
      @account_parent = AccountParent.create!(:name => 'Account parent', :locale_id => @account.locale_id)
      @user = Factory.create(:user)
      @account_parent_account_user = AccountUser.create!(:user_id => @user.id, :account_id => @account_parent.id, :privilege => 'read', :admin => false)
    end

    it 'should provide read privileges from the parent when no privileges are set for this user' do
      @account.stub_chain(:privileges, :where) { nil } # return no privileges for this child account

      @account.can?(:read, @user).should be_true
      @account.can?(:full, @user).should be_false
    end

    it 'should provide all (admin) privileges from the parent when no privileges are set for this user but use has admin rights in parent' do
      @account.stub_chain(:privileges, :where) { nil } # return no privileges for this child account
      @account_parent_account_user.update_attributes! :admin => true
      @account.reload
      @user.reload

      @account.can?(:read, @user).should be_true
      @account.can?(:full, @user).should be_true
    end

    it 'should provide read privileges from the parent when nil (inherit) privileges are set for this user' do
      @account.stub_chain(:privileges, :where, :first, :privilege) { nil } # return nil privilege for the user_account record for this child account indicating inheritance

      @account.can?(:read, @user).should be_true
      @account.can?(:full, @user).should be_false
    end

    it 'should provide full privileges when child overwrites parent privileges' do
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @account_user.update_attributes :privilege => 'full'
      @account.reload
      @account.can?(:read, @account_user.user).should be_true
      @account.can?(:full, @account_user.user).should be_true
    end

    it 'should provide none privileges when child overwrites parent privileges' do
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @account_user.update_attributes :privilege => 'none'
      @account.reload
      @account.can?(:read, @account_user.user).should be_false
      @account.can?(:full, @account_user.user).should be_false
    end
  end

  context 'instance methods for an object with inherited parent privileges and no local privileges' do
    before (:each) do
      @account = Factory.create(:account)
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @backlog = Factory.create(:backlog, :account => @account)
      @backlog.class.can_do :inherited_privilege => :account # force re-initialise so we don't depend on Account specification
      @user = @backlog.account.users.first
    end

    it 'should provide read privileges from the parent' do
      @backlog.can?(:read, @user).should be_true
      @backlog.can?(:full, @user).should be_false
    end
  end

  context 'instance methods for an object with preferenced inherited parent privileges and no local privileges' do
    before (:each) do
      @account = Factory.create(:account)
      @account_user = Factory.create(:account_user_with_read_rights, :account => @account)
      @backlog = Factory.create(:backlog, :account => @account)
      @backlog.class.can_do :inherited_privilege => [:company, :account] # force re-initialise so we don't depend on Account specification
      @user = @backlog.account.users.first
    end

    it 'should provide read privileges from the account parent and ignore company if blank' do
      @account.stub(:company) { nil }
      @backlog.can?(:read, @user).should be_true
      @backlog.can?(:full, @user).should be_false
    end

    it 'should provide full privileges from the company parent as not blank' do
      company = Factory.create(:company, :account => @account)
      company_user = Factory.create(:company_user_with_full_rights, :company => company, :user => @user)
      @backlog.company = company
      @backlog.save!

      @backlog.company.can?(:full, @user).should be_true
      @backlog.can?(:read, @user).should be_true
      @backlog.can?(:full, @user).should be_true
    end
  end
end
