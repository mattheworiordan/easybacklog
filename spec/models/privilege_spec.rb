# encoding: UTF-8

require 'spec_helper'

describe Privilege do
  subject { Privilege }
  it 'should default to none' do
    subject.new('does not exist').privilege.should == subject.find(:none).privilege
  end

  it 'should have full as the highest' do
    subject.highest.privilege.should == subject.find(:full).privilege
  end

  it 'should return the highest of the two privileges' do
    priv = subject.none
    priv.privilege.should == subject.find(:none).privilege
    priv.highest(subject.find(:read)).should == subject.find(:read)

    priv_full = subject.highest
    priv_full.privilege.should == subject.find(:full).privilege
    priv_full.highest(subject.find(:read)).should == subject.find(:full)
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
