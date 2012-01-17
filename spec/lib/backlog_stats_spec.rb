# encoding: UTF-8
require 'spec_helper'

describe BacklogStats do
  subject { BacklogStats.new backlog }

  let(:backlog) { Factory.create(:backlog, :velocity => 3, :rate => 800) }
  let(:theme) { Factory.create(:theme, :backlog => backlog) }
  let!(:story_complete) { Factory.create(:sprint_story_status_done) }
  let!(:scoring_rule) { Factory.create(:scoring_rule_default) }

  [[:sprint1, '3 Jan 2011', 13], [:sprint2, '10 Jan 2011', 13], [:sprint3, '17 Jan 2011', 21]].each do |sprint, start_on, points|
    let!(sprint) {
      sp = Factory.create(:sprint, :backlog => backlog, :start_on => start_on, :number_team_members => 1, :duration_days => 5)
      story = Factory.create(:story, :theme => theme, :score => points)
      sp.sprint_stories.create! :story_id => story.id, :sprint_story_status_id => story_complete.id
      sp.reload
      sp.mark_as_complete
      sp
    }
  end

  it 'should never show burn down JSON as past zero so should adjust total completed points back to zero and scale other values' do
    # set total accumulative completed points for the backlog to -2
    # set total points completed in this sprint to 10 points
    # 2 points have thus been completed per day
    sprint = sprint1 # instance_eval does not have access to sprint1
    json = subject.instance_eval { burn_down_json(sprint, -2, 10, Date.parse('7 Jan 2011'), 5) }

    json[:completed_on].should == Date.parse('6 Jan 2011') # move back one day as 2 points shift back to zero would equate to one day
    json[:points].should == 0
    json[:completed].should == 8
    json[:duration].should == 4
  end

  it 'should never show burn down JSON as past zero so should adjust total completed points back to zero and scale other values and allow for fractional days' do
    # set total accumulative completed points for the backlog to -3
    # set total points completed in this sprint to 10 points
    # 2 points have thus been completed per day
    sprint = sprint1 # instance_eval does not have access to sprint1
    json = subject.instance_eval { burn_down_json(sprint, -3, 10, Date.parse('7 Jan 2011'), 5) }

    json[:completed_on].should == Date.parse('6 Jan 2011') # move back one day as 2 points shift back to zero would equate to one day
    json[:points].should == 0
    json[:completed].should == 7
    json[:duration].should == 4
  end

  it 'should return a trend line based on expected velocity and team size' do
    total_points = 3 * 5 * 5 - 1 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks minus 1 day (finish one day early of a week)
    backlog.stub(:points) { total_points }

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

  it 'should return an actual line based on completed sprints where projected is similar to actual' do
    total_points = 3 * 5 * 5 - 1 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks minus 1 day (finish one day early of a week)
    backlog.stub(:points) { total_points }

    json = subject.burn_down_data
    actual = json[:actual]

    # check sprint zero defaults in this test
    actual.first[:starts_on].should == Date.parse('3 Jan 2011')
    actual.first[:points].should == total_points
    actual.first[:completed].should == 0 # no points completed in sprint 0

    actual[1][:starts_on].should == Date.parse('3 Jan 2011')
    actual[1][:completed_on].should == actual[1][:starts_on] + 4.days
    actual[1][:points].should == total_points - 13
    actual[1][:completed].should == 13
    actual[1][:iteration].should == 1
    actual[1][:team].should == 1
    actual[1][:duration].should == 5
    actual[1][:actual].should == 13.0/5.0 # 13 points for this sprint

    actual[3][:starts_on].should == Date.parse('3 Jan 2011') + 2.weeks
    actual[3][:completed_on].should == actual[3][:starts_on] + 4.days
    actual[3][:points].should == total_points - 13 - 13 - 21
    actual[3][:completed].should == 21

    actual.count.should == 4 # 3 sprints + sprint zero
  end

  it 'should return an actual line based on completed sprints where projected is much quicker than actual' do
    total_points = 3 * 5 * 5 - 1 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks minus 1 day (finish one day early of a week)
    backlog.stub(:points) { total_points }
    backlog.velocity = 15

    json = subject.burn_down_data
    actual = json[:actual]

    actual[1][:starts_on].should == Date.parse('3 Jan 2011')
    actual[1][:completed_on].should == actual[1][:starts_on] + 4.days
    actual[1][:points].should == total_points - 13
    actual[1][:completed].should == 13

    actual[3][:starts_on].should == Date.parse('3 Jan 2011') + 2.weeks
    actual[3][:points].should == total_points - 13 - 13 - 21
    actual[3][:completed].should == 21

    actual.count.should == 4 # 3 sprints + sprint zero
  end

  it 'should return an actual line based on completed sprints where projected is much slower than actual' do
    total_points = 3 * 5 * 5 - 1 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks minus 1 day (finish one day early of a week)
    backlog.stub(:points) { total_points }

    backlog.velocity = 1

    json = subject.burn_down_data
    actual = json[:actual]

    actual[1][:starts_on].should == Date.parse('3 Jan 2011')
    actual[1][:completed_on].should == actual[1][:starts_on] + 4.days
    actual[1][:points].should == total_points - 13
    actual[1][:completed].should == 13

    actual[3][:starts_on].should == Date.parse('3 Jan 2011') + 2.weeks
    actual[3][:points].should == total_points - 13 - 13 - 21
    actual[3][:completed].should == 21

    actual.count.should == 4 # 3 sprints + sprint zero
  end

  it 'should not return any actual data if no sprints are completed' do
    total_points = 3 * 5 * 5 - 1 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks minus 1 day (finish one day early of a week)
    backlog.stub(:points) { total_points }

    sprint3.mark_as_incomplete
    sprint2.mark_as_incomplete
    sprint1.mark_as_incomplete

    json = subject.burn_down_data
    actual = json[:actual]

    actual.count.should == 0
  end

  it 'should return valid trend data when day and cost estimations are turned off' do
    backlog.update_attributes! :velocity => nil, :rate => nil # this should trigger all sprints to be marked with explicit velocities
    backlog.sprints.first.explicit_velocity.should == 15 # (5 days, 3 points a day, 1 person)
    backlog.sprints.last.explicit_velocity.should == 15
    backlog.sprints.last.mark_as_incomplete
    backlog.sprints.last.update_attributes! :explicit_velocity => 10 # slow down the last sprint for testing so that we estimate 10 points per day moving forwards
    backlog.sprints.last.mark_as_complete

    total_points = 3 * 5 * 5 # force backlog total points to 3 points a day, for 5 days a week for 5 weeks (75 points) (finish one day early of a week)
    # we now expect first sprint completes 15, second takes us to 30, third takes us to 40, fourth takes us to 50, 5th to 60, 6th to 70, and 7th to 75
    backlog.stub(:points) { total_points }

    json = subject.burn_down_data
    trend = json[:trend]

    trend.first[:starts_on].should == Date.parse('3 Jan 2011')
    trend.first[:points].should == total_points
    trend.first[:completed].should == 0 # no points completed in sprint 0

    trend[1][:completed].should == 3 * 5

    trend.count.should == 8 # 7 weeks, first sprint is zero
    trend.last[:starts_on].should == Date.parse('3 Jan 2011') + 6.weeks # 1st week starts_on day one, so push forwards only 6 weeks
    trend.last[:completed_on].should == trend.last[:starts_on] + 2.days # 10 points a week, thus 2.5 days
    trend.last[:completed].should == 5
    trend.last[:points].should == 0

    # team size and actual velocity per day should not be included as this sprint uses explicit velocity
    trend.last.should_not have_key(:team)
    trend.last.should_not have_key(:actual)
  end

  it 'should not return actual day velocity when cost estimations are turned off' do
    backlog.update_attributes! :velocity => nil, :rate => nil # this should trigger all sprints to be marked with explicit velocities

    json = subject.velocity_stats
    json.should_not have_key(:actual_day)
    json.should_not have_key(:expected_day)

    backlog.update_attributes! :velocity => 5, :rate => 500 # set backlog back to use estimates

    # as we have one or more sprints that now use explicit velocity per sprint, we should no longer see day velocity estimates
    json = subject.velocity_stats
    json.should_not have_key(:actual_day)
    json.should_not have_key(:expected_day)
  end
end
