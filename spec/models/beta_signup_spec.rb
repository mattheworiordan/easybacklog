# encoding: UTF-8

require 'spec_helper'

describe BetaSignup do
  it 'should validate the email address' do
    a = FactoryGirl.create(:beta_signup)
    a.email = "invalid email address"
    a.save
    a.errors[:email].should_not be_empty
  end

  it 'should not allow duplicate email addresses' do
    a = FactoryGirl.create(:beta_signup)
    expect { FactoryGirl.create(:beta_signup, :email => a.email) }.to raise_exception
  end

  it 'should create a unique code every time' do
    a = FactoryGirl.create(:beta_signup)
    b = FactoryGirl.create(:beta_signup)

    a.unique_code.should match(/[a-z]{6}/)
    a.unique_code.should_not == b.unique_code

    c = BetaSignup.find_or_create_by_email(a.email)
    c.save!
    c.unique_code.should == a.unique_code
  end

  it 'should log the number of times it has been clicked and have a default of zero' do
    a = FactoryGirl.create(:beta_signup)

    a.clicks.should == 0
    a.log_click
    a.log_click
    a.clicks.should == 2
  end
end
