# encoding: UTF-8
require 'spec_helper'

describe BacklogStats do
  let(:backlog) { Factory.create(:backlog, :velocity => 3, :rate => 800) }
  subject { BacklogStats.new backlog }

  it 'should never show burn down JSON as past zero so should adjust total completed points back to zero and scale other values' do
    sprint = Factory.create(:sprint, :backlog => backlog, :start_on => '3 Jan 2011', :number_team_members => 1, :duration_days => 5)
    # set total accumulative completed points for the backlog to -2
    # set total points completed in this sprint to 10 points
    # 2 points have thus been completed per day
    json = subject.burn_down_json(sprint, -2, 10, Date.parse('7 Jan 2011'), 5)

    json[:completed_on].should == Date.parse('6 Jan 2011') # move back one day as 2 points shift back to zero would equate to one day
    json[:points].should == 0
    json[:completed].should == 8
    json[:duration].should == 4
  end

  it 'should never show burn down JSON as past zero so should adjust total completed points back to zero and scale other values and allow for fractional days' do
    sprint = Factory.create(:sprint, :backlog => backlog, :start_on => '3 Jan 2011', :number_team_members => 1, :duration_days => 5)
    # set total accumulative completed points for the backlog to -3
    # set total points completed in this sprint to 10 points
    # 2 points have thus been completed per day
    json = subject.burn_down_json(sprint, -3, 10, Date.parse('7 Jan 2011'), 5)

    json[:completed_on].should == Date.parse('6 Jan 2011') # move back one day as 2 points shift back to zero would equate to one day
    json[:points].should == 0
    json[:completed].should == 7
    json[:duration].should == 4
  end

end
