# encoding: UTF-8

require 'spec_helper'

describe Privilege do
  subject { Privilege }

  it 'should default to none' do
    subject.new('does not exist').to_param.should == subject.find(:none).to_param
  end

  it 'should have full as the highest' do
    subject.highest.code.should == subject.find(:full).code
  end

  it 'should return the highest of the two privileges' do
    priv = subject.none
    priv.code.should == subject.find(:none).code
    priv.highest(subject.find(:read)).should == subject.find(:read)

    priv_full = subject.highest
    priv_full.should == subject.find(:full)
    priv_full.highest(subject.find(:read)).should == subject.find(:full)
  end

  it 'should return a description' do
    subject.find(:none).description.should == 'No access'
  end

  context "Using the can? method" do
    it 'should return true when privilege requested is lower than the current privilege' do
      priv = subject.new(:readstatus)
      priv.can?(:read).should be_true
    end

    it 'should return true when privilege requested is the same as the current privilege' do
      priv = subject.new(:readstatus)
      priv.can?(subject.new(:readstatus)).should be_true
    end

    it 'should return false when privilege requested is the higher than the current privilege' do
      priv = subject.new(:readstatus)
      priv.can?('full').should be_false
    end
  end
end
