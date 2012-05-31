# encoding: UTF-8

require 'spec_helper'

describe InvitedUser do
  it 'should create a unique security code every time' do
    a = FactoryGirl.create(:invited_user)
    b = FactoryGirl.create(:invited_user)

    a.security_code.should match(/[a-z]{10}/)
    a.security_code.should_not eql(b.security_code)
  end
end
