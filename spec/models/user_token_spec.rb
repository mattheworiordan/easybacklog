# encoding: UTF-8

require 'spec_helper'

describe UserToken do
  it 'should assign a unique access_token on create' do
    a = FactoryGirl.create(:user_token)
    b = FactoryGirl.create(:user_token)
    a.access_token.should_not be_empty
    a.access_token.should_not == b.access_token
  end

  it 'should generate a base 64 encoding for basic authentication' do
    a = FactoryGirl.create(:user_token)
    a.basic_authentication_token.should == Base64::encode64("#{a.user.id}:#{a.access_token}")
  end

  it 'should not allow changes to the record' do
    a = FactoryGirl.create(:user_token)
    a.access_token = 'test'
    expect { a.save! }.should raise_error ActiveRecord::ReadOnlyRecord
  end
end
