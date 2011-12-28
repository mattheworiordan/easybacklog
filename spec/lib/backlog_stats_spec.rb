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

  it 'should return a trend line based on expected velocity and team size' do
    total_points = 3 * 5 * 5 - 1 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks minus 1 day (finish one day early of a week)
    backlog.stub(:points) { total_points }
    sprint = Factory.create(:sprint, :backlog => backlog, :start_on => '3 Jan 2011', :number_team_members => 1, :duration_days => 5)
    json = subject.burn_down_data

    trend = json[:trend]
    trend.first[:starts_on].should == Date.parse('3 Jan 2011')
    trend.first[:points].should == total_points
    trend.first[:completed].should == 0 # no points completed in sprint 0

    trend[1][:completed].should == 3 * 5

    trend.count.should == 6 # 5 weeks, first sprint is zero
    trend.last[:starts_on].should == Date.parse('3 Jan 2011') + 4.weeks
    trend.last[:completed_on].should == trend.last[:starts_on] + 4.days
    trend.last[:completed].should == 3 * 5 - 1
    trend.last[:points].should == 0
  end
end
