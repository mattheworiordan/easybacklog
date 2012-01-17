# encoding: UTF-8

require 'spec_helper'

describe Company do
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  it 'should only allow a rate if velocity is present' do
    company = Factory.create(:company, :default_rate => 50, :default_velocity => nil)
    company.default_rate.should be_blank

    company = Factory.create(:company, :default_rate => 50, :default_velocity => 5)
    company.default_rate.should == 50
  end
end