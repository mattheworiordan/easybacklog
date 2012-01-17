# encoding: UTF-8

require 'spec_helper'

describe Sprint do
  # default sprint story status is needed when any story is assigned to a sprint
  let!(:default_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:done_sprint_story_status) { Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE) }
  let!(:default_scoring_rule) { Factory.create(:scoring_rule_default) }

  it 'should create a new iteration automatically for each sprint created' do
    # get a backlog set up with at least one story
    acceptance_criterion = Factory.create(:acceptance_criterion)
    backlog = acceptance_criterion.story.theme.backlog

    sprint = backlog.sprints.create!(:start_on => Date.today, :number_team_members => 2, :duration_days => 10)
    sprint.iteration.should == 1

    sprint = backlog.sprints.create!(:start_on => Date.today + 10.days, :number_team_members => 2, :duration_days => 10)
    sprint.iteration.should == 2
  end

  it 'should not allow overlapping iterations in terms of days' do
    sprint1 = Factory.create(:sprint, :start_on => Date.today, :duration_days => 10)
    expect { sprint2 = Factory.create(:sprint, :start_on => Date.today, :backlog_id => sprint1.backlog.id) }.should raise_error ActiveRecord::RecordInvalid, /Start date and duration overlaps with sprint 1/
    expect { sprint2 = Factory.create(:sprint, :start_on => Date.today + 9.days, :backlog_id => sprint1.backlog.id) }.should raise_error ActiveRecord::RecordInvalid, /Start date and duration overlaps with sprint 1/
    sprint1.iteration.should == 1

    sprint2 = Factory.create(:sprint, :start_on => Date.today + 10.days, :backlog_id => sprint1.backlog.id)
    sprint2.start_on = Date.today
    expect { sprint2.save! }.should raise_error ActiveRecord::RecordInvalid, /Start date and duration overlaps with sprint 1/
    sprint2.iteration.should == 2

    sprint1.reload
    sprint1.duration_days = 15
    expect { sprint1.save! }.should raise_error ActiveRecord::RecordInvalid, /Start date and duration overlaps with sprint 2/

    sprint1.duration_days = 5
    expect { sprint1.save! }.should_not raise_error
  end

  it 'should not allow you to delete a sprint unless it is the last sprint' do
    sprint1 = Factory.create(:sprint, :start_on => Date.today, :duration_days => 1)
    backlog = sprint1.backlog
    sprint2 = Factory.create(:sprint, :start_on => Date.today + 1.day, :duration_days => 1, :backlog_id => backlog.id)
    sprint3 = Factory.create(:sprint, :start_on => Date.today + 2.days, :duration_days => 1, :backlog_id => backlog.id)
    sprint4 = Factory.create(:sprint, :start_on => Date.today + 3.days, :duration_days => 1, :backlog_id => backlog.id)

    sprint2.reload
    sprint2.deletable?.should be_false
    expect { sprint2.destroy }.should raise_error
    sprint3.reload
    sprint3.deletable?.should be_false
    expect { sprint3.destroy }.should raise_error
    sprint4.reload
    sprint4.deletable?.should be_true
    sprint4.destroy
    sprint3.reload
    sprint3.destroy
    sprint1.reload
    expect { sprint1.destroy }.should raise_error
  end

  it 'should not allow you to change a sprint iteration' do
    sprint1 = Factory.create(:sprint, :start_on => Date.today, :duration_days => 1)
    backlog = sprint1.backlog
    sprint2 = Factory.create(:sprint, :start_on => Date.today + 1.day, :duration_days => 1, :backlog_id => backlog.id)
    sprint1.iteration = 3
    expect { sprint1.save! }.should raise_error ActiveRecord::RecordInvalid
    sprint2.iteration = 4
    expect { sprint2.save! }.should raise_error ActiveRecord::RecordInvalid

    sprint1.update_attributes :iteration => 3
    sprint1.reload
    sprint1.iteration.should == 1
  end

  it 'should not allow you to make changes once marked as completed' do
    sprint1 = Factory.create(:sprint, :start_on => Date.today)
    theme = Factory.create(:theme, :backlog_id => sprint1.backlog.id)
    story1 = Factory.create(:story, :theme_id => theme.id)

    sprint1.stories << story1
    story1.reload
    story1.sprint_story_status = done_sprint_story_status

    # now mark as completed (read-only)
    sprint1.completed_at = Time.now
    sprint1.save!

    story2 = Factory.create(:story, :theme_id => theme.id)
    expect { sprint1.stories << story2 }.should raise_error ActiveRecord::RecordNotSaved, /Stories cannot be added\/removed from this sprint as the sprint is complete/
    expect { sprint1.stories.delete(sprint1.stories.first) }.should raise_error ActiveRecord::RecordNotSaved, /Stories cannot be added\/removed from this sprint as the sprint is complete/

    # All sprint fields should be non-editable
    sprint1.start_on = Date.today + 1.day
    expect { sprint1.save! }.should raise_error ActiveRecord::RecordInvalid
    sprint1.reload
    sprint1.duration_days = sprint1.duration_days + 1
    expect { sprint1.save! }.should raise_error ActiveRecord::RecordInvalid
  end

  it 'should not allow to be marked as complete if any of the stories are not done' do
    sprint = Factory.create(:sprint, :start_on => Date.today)
    theme = Factory.create(:theme, :backlog_id => sprint.backlog.id)

    # 0 stories, so allow mark as complete
    expect { sprint.mark_as_complete }.should_not raise_error

    sprint.mark_as_incomplete
    sprint.stories << Factory.create(:story, :theme_id => theme.id)
    sprint.reload
    expect { sprint.mark_as_complete }.should raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as complete when it contains stories that are not done/

    sprint.stories.first.sprint_story_status = done_sprint_story_status
    expect { sprint.mark_as_incomplete }.should_not raise_error

    sprint.stories << Factory.create(:story, :theme_id => theme.id)
    sprint.reload
    expect { sprint.mark_as_complete }.should raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as complete when it contains stories that are not done/
  end

  it 'should not allow a successive sprint start on or before a previous sprint even if it doesn\'t overlap' do
    sprint1 = Factory.create(:sprint, :start_on => Date.today, :duration_days => 10)
    expect { sprint2 = Factory.create(:sprint, :start_on => Date.today - 10.days, :backlog_id => sprint1.backlog.id) }.should raise_error ActiveRecord::RecordInvalid, /Start date is before sprint 1/

    sprint2 = Factory.create(:sprint, :start_on => Date.today + 30.days, :backlog_id => sprint1.backlog.id)

    # in between sprint 1 and 2, but still before print 2
    expect { Factory.create(:sprint, :start_on => Date.today + 15.days, :backlog_id => sprint1.backlog.id) }.should raise_error ActiveRecord::RecordInvalid, /Start date is before sprint 2/
  end

  it 'should calculate total story points and allowed points based on backlog & sprint settings and stories assigned' do
    backlog = Factory.create(:backlog, :velocity => 5)
    theme = Factory.create(:theme, :backlog => backlog)
    sprint = Factory.create(:sprint, :backlog => backlog, :duration_days => 5, :number_team_members => 5)
    sprint.total_expected_points.should == 5*5*5

    sprint.duration_days = 4
    sprint.number_team_members = 3
    sprint.save!
    backlog.velocity = 2
    backlog.save!
    sprint.reload
    sprint.total_expected_points.should == 4*3*2

    story1 = Factory.create(:story, :theme => theme, :score_50 => 5, :score_90 => 5)
    sprint.stories << story1
    sprint.reload
    sprint.total_allocated_points.should == 5

    story2 = Factory.create(:story, :theme => theme, :score_50 => 1, :score_90 => 3)
    sprint.stories << story2
    sprint.reload
    sprint.total_allocated_points.should == 5 + 1 + Math.sqrt(2 ** 2)

    story3 = Factory.create(:story, :theme => theme, :score_50 => 2, :score_90 => 3)
    sprint.stories << story3
    sprint.reload
    sprint.total_allocated_points.should == 5 + 1 + 2 + Math.sqrt(2**2 + 1**2)

    story3.sprint_story_status = done_sprint_story_status
    story3.save
    sprint.reload
    sprint.total_completed_points.should == 2 + Math.sqrt(1**2)

    story3.sprint_story.sprint_statistics.should == {
      :total_expected_points => 4*3*2,
      :total_completed_points => 2 + Math.sqrt(1**2),
      :total_allocated_points => 5 + 1 + 2 + Math.sqrt(2**2 + 1**2)
    }
  end

  context 'when there are multiple completed sprints' do
    before do
      @sprint_first = Factory.create(:sprint, :completed_at => Time.now)
      @sprint_second = Factory.create(:sprint, :backlog => @sprint_first.backlog, :completed_at => Time.now)
      @sprint_third = Factory.create(:sprint, :backlog => @sprint_first.backlog, :completed_at => Time.now)
    end

    it 'should not allow you to mark an earlier sprint as incomplete' do
      expect { @sprint_first.mark_as_incomplete }.to raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as incomplete unless sprint 2 is marked as incomplete/
      expect { @sprint_second.mark_as_incomplete }.to raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as incomplete unless sprint 3 is marked as incomplete/
      expect { @sprint_third.mark_as_incomplete }.to_not raise_error
    end
  end

  context 'when there are multiple incomplete sprints' do
    before do
      @sprint_first = Factory.create(:sprint)
      @sprint_second = Factory.create(:sprint, :backlog => @sprint_first.backlog)
      @sprint_third = Factory.create(:sprint, :backlog => @sprint_first.backlog)
    end

    it 'should not allow you to mark an earlier sprint as complete' do
      expect { @sprint_second.mark_as_complete }.to raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as complete unless sprint 1 is marked as complete/
      expect { @sprint_third.mark_as_complete }.to raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as complete unless sprint 2 is marked as complete/
      expect { @sprint_first.mark_as_complete }.to_not raise_error
    end
  end

  it 'should ensure when a sprint is destroyed all related snapshots are deleted' do
    backlog = Factory.create(:backlog, :name => 'Parent')
    sprint = Factory.create(:sprint, :backlog => backlog)
    sprint.create_snapshot_if_missing
    sprint.reload

    sprint.snapshot.should be_present
    sprint_snapshot_id = sprint.snapshot.id

    sprint.destroy

    # check that snapshot has been deleted with the sprint
    Backlog.where("id in (#{sprint_snapshot_id})").count.should eql(0)
  end

  it 'should create a snapshot when marked as complete' do
    # if we've not yet created a snapshot for this sprint because date is in the future, create a snapshot immediately
    # so we get the best possible picture of the sprint at the time
    sprint = Factory.create(:sprint)
    sprint.snapshot.should be_blank

    sprint.mark_as_complete
    sprint.reload
    sprint.snapshot.should be_present
  end

  it 'should delete the snapshot when start date is set in the future' do
    # if a sprint start date is shifted into the future, then if we have a snapshot
    # for this sprint it will be incorrect as it's not a snapshat when the sprint started
    sprint = Factory.create(:sprint)
    sprint.create_snapshot_if_missing
    sprint.reload
    sprint.snapshot.should be_present

    sprint.update_attributes :start_on => Time.now + 2.days
    sprint.reload
    sprint.snapshot.should_not be_present
  end

  it 'should return a list of sprints needing snapshots' do
    eligible_sprint = Factory.create(:sprint, :start_on => Time.now - 1.day)
    ineligible_sprint = Factory.create(:sprint, :backlog => eligible_sprint.backlog, :start_on => Time.now + 1.day)

    Sprint.in_need_of_snapshot.all.should include eligible_sprint
    Sprint.in_need_of_snapshot.all.should_not include ineligible_sprint
  end

  it 'should return total expected points based on backlog average' do
    backlog = Factory.create(:backlog, :velocity => 10)
    theme = Factory.create(:theme, :backlog => backlog)

    # No completed sprints, estimation is based on settings
    sprint = Factory.create(:sprint, :backlog => backlog, :duration_days => 10, :number_team_members => 5)
    # average for Backlog will be 10 as there are no completed sprints
    sprint.total_expected_based_on_average_points.should == 10 * 10 * 5

    # two completed sprints, one empty one with a 21 point story
    story = Factory.create(:story, :theme => theme, :score_50 => 21, :score_90 => 21)
    sprint.stories << story
    story.reload
    story.sprint_story_status = done_sprint_story_status
    sprint.mark_as_complete

    sprint2 = Factory.create(:sprint, :backlog => backlog, :duration_days => 10, :number_team_members => 1)
    sprint2.mark_as_complete
    sprint2.reload
    sprint2.total_expected_based_on_average_points.should == (21.0 + 0.0) / 2.0

    # new sprint added that is not complete, should not have any effect
    was_average = sprint2.total_expected_based_on_average_points
    sprint3 = Factory.create(:sprint, :backlog => backlog, :duration_days => 10, :number_team_members => 20)
    sprint3.total_expected_based_on_average_points.should == was_average
  end

  it 'should return total expected points based on backlog average from completed sprints when using explicit points' do
    backlog = Factory.create(:backlog, :velocity => 10)

    # No completed sprints, estimation is based on settings
    sprint = Factory.create(:sprint, :backlog => backlog, :duration_days => 10, :explicit_velocity => 20)
    sprint.total_expected_based_on_average_points.should == 20
  end

  it 'should return actual velocity completed for completed stories' do
    backlog = Factory.create(:backlog, :velocity => 10)
    sprint = Factory.create(:sprint, :backlog => backlog, :duration_days => 10, :number_team_members => 5)
    story = Factory.create(:story, :score_50 => 2, :score_90 => 2)
    sprint.stories << story
    story.sprint_story.sprint_story_status = done_sprint_story_status
    story.sprint_story.save!
    sprint.reload
    sprint.actual_velocity.should == 2.to_f / 10 / 5
  end

  it 'should return a completed on date one day before the next sprint starts accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Monday of 2012, with 10 days duration, should therefore end on last Friday of 2nd week
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => '2 Jan 2012', :duration_days => 10)
    sprint2 = Factory.create(:sprint, :backlog => backlog, :start_on => '16 Jan 2012', :duration_days => 10)
    sprint1.completed_on.should == Date.parse('Fri 13 Jan 2012')
  end

  it 'should return a completed on date one day before the next sprint starts accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Monday of 2012, with 3 days duration, next sprint starts on the following Monday 9th
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => '2 Jan 2012', :duration_days => 5)
    sprint2 = Factory.create(:sprint, :backlog => backlog, :start_on => '9 Jan 2012', :duration_days => 5)
    sprint1.completed_on.should == Date.parse('Fri 6 Jan 2012')
  end

  it 'should return a completed on date one day before the next sprint starts accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Monday of 2012, second sprint starts the day after
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => '2 Jan 2012', :duration_days => 1)
    sprint2 = Factory.create(:sprint, :backlog => backlog, :start_on => '3 Jan 2012', :duration_days => 1)
    sprint1.completed_on.should == Date.parse('2 Jan 2012')
  end

  it 'should return a completed on date one day before the next sprint starts accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Saturday of 2012, second sprint starts the following Sunday
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => 'Sat 7 Jan 2012', :duration_days => 5)
    sprint2 = Factory.create(:sprint, :backlog => backlog, :start_on => 'Sun 15 Jan 2012', :duration_days => 5)
    sprint1.completed_on.should == Date.parse('Fri 13 Jan 2012')
  end

  it 'should return an assumed completed on date based on sprint and accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Monday of 2012, with 10 days duration, should therefore end on last Friday of 2nd week
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => '2 Jan 2012', :duration_days => 10)
    sprint1.assumed_completed_on.should == Date.parse('Fri 13 Jan 2012')
  end

  it 'should return an assumed completed on date based on sprint and accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Friday of 2012, with 1 days duration, should therefore end on Friday
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => 'Fri 6 Jan 2012', :duration_days => 1)
    sprint1.assumed_completed_on.should == Date.parse('Fri 6 Jan 2012')
  end

  it 'should return an assumed completed on date based on sprint and accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 1st Friday of 2012, with 2 days duration, should therefore end on Monday
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => 'Fri 6 Jan 2012', :duration_days => 2)
    sprint1.assumed_completed_on.should == Date.parse('Mon 9 Jan 2012')
  end

  it 'should return an assumed completed on date based on sprint and accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 2nd Sunday of 2012, with 5 days duration, should therefore end on following Friday
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => 'Sun 8 Jan 2012', :duration_days => 5)
    sprint1.assumed_completed_on.should == Date.parse('Fri 13 Jan 2012')
  end

  it 'should return an assumed completed on date based on sprint and accounting for weekends' do
    backlog = Factory.create(:backlog)
    # first sprint starts on 2nd Sunday of 2012, with 6 days duration, should therefore end one week on Monday
    sprint1 = Factory.create(:sprint, :backlog => backlog, :start_on => 'Sun 8 Jan 2012', :duration_days => 6)
    sprint1.assumed_completed_on.should == Date.parse('Mon 16 Jan 2012')
  end

  it 'should return explicit velocity for total expected points when explicit velocity set in sprint' do
    backlog = Factory.create(:backlog, :velocity => nil)
    sprint = Factory.create(:sprint, :backlog => backlog, :explicit_velocity => 12, :number_team_members => nil)
    sprint.total_expected_points.should == 12

    backlog2 = Factory.create(:backlog, :velocity => 5)
    sprint2 = Factory.create(:sprint, :backlog => backlog2, :explicit_velocity => 12)
    sprint2.total_expected_points.should == 12
  end

  it 'should require an explicit velocity when backlog average velocity not set' do
    backlog = Factory.create(:backlog, :velocity => nil)
    expect { Factory.create(:sprint, :backlog => backlog, :number_team_members => nil) }.should raise_error ActiveRecord::RecordInvalid, /Explicit velocity can't be blank/
  end

  it 'should not allow number_team_members to be set when backlog average velocity is not set' do
    backlog = Factory.create(:backlog, :velocity => nil)
    expect { Factory.create(:sprint, :backlog => backlog, :number_team_members => 5) }.should raise_error ActiveRecord::RecordInvalid, /Number team members is not editable with this backlog/
  end

  it 'should update explicit velocity based on calculated velocity when backlog settings change triggered' do
    backlog = Factory.create(:backlog, :velocity => 4)
    sprint = Factory.create(:sprint, :backlog => backlog, :number_team_members => 2, :duration_days => 3)
    sprint.mark_as_complete # ensure we test with completed sprints which are technically not editable
    sprint.total_expected_points.should == 4 * 2 * 3

    sprint.convert_to_explicit_velocity

    sprint.total_expected_points.should == 4 * 2 * 3
    sprint.number_team_members.should be_nil
  end
end
