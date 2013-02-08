# encoding: UTF-8

require 'spec_helper'

describe Company do
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }

  it 'should only allow a rate if velocity is present' do
    expect { FactoryGirl.create(:company, :default_rate => 50, :default_velocity => nil)}.to raise_error ActiveRecord::RecordInvalid, /Default rate cannot be specified if default velocity is empty/

    company = FactoryGirl.create(:company, :default_rate => 50, :default_velocity => 5)
    company.default_rate.should == 50
  end

  context 'locale' do
    let(:default_locale) { FactoryGirl.create(:locale) }
    let(:other_locale) { FactoryGirl.create(:locale) }
    let(:account) { FactoryGirl.create(:account, locale: default_locale) }
    subject { FactoryGirl.create(:company, account: account) }

    it 'should inherit from the account if not set' do
      subject.locale.should == default_locale
      subject.locale_id.should == nil
    end

    it 'should use the set locale if chosen' do
      subject.locale = other_locale
      subject.locale.should == other_locale
      subject.locale_id.should == other_locale.id
    end

    it 'should allow the locale to be set to nil and thus inherit' do
      subject.locale = other_locale
      subject.locale = nil
      subject.locale.should == default_locale
      subject.locale_id.should == nil
    end

    it 'should always provide access to default locale' do
      subject.default_locale.should == default_locale
      subject.locale = other_locale
      subject.default_locale.should == default_locale
    end
  end

  context 'company_users' do
    let(:account) { FactoryGirl.create(:account) }
    let(:user) { FactoryGirl.create(:user) }
    subject { FactoryGirl.create(:company, :account => account) }

    describe '#delete_user' do
      it 'should delete the company user that exists' do
        FactoryGirl.create(:company_user, :company => subject, :user => user)
        subject.company_users.map(&:user).should include(user)
        subject.delete_user user
        subject.reload
        subject.company_users.map(&:user).should_not include(user)
      end

      it 'should not fail if delete is called without any company user' do
        subject.delete_user user
        subject.company_users.map(&:user).should_not include(user)
      end
    end

    describe '#add_or_update_user' do
      it 'should update the existing user when one exists' do
        FactoryGirl.create(:company_user_with_no_rights, :company => subject, :user => user)
        subject.company_users.map(&:user).should include(user)
        subject.add_or_update_user user, :full
        subject.reload
        subject.company_users.map(&:user).should include(user)
        subject.company_users.first.privilege.should == Privilege.find(:full)
      end

      it 'should add a new user when one does not exist' do
        subject.add_or_update_user user, :read
        subject.reload
        subject.company_users.map(&:user).should include(user)
        subject.company_users.first.privilege.should == Privilege.find(:read)
      end
    end
  end
end