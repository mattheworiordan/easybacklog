# encoding: UTF-8

require 'spec_helper'

describe Sprint do
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
    done = Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE)
    sprint1 = Factory.create(:sprint, :start_on => Date.today)
    theme = Factory.create(:theme, :backlog_id => sprint1.backlog.id)
    story1 = Factory.create(:story, :theme_id => theme.id)

    sprint1.stories << story1
    story1.reload
    story1.sprint_story_status = done

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
    done = Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE)
    sprint = Factory.create(:sprint, :start_on => Date.today)
    theme = Factory.create(:theme, :backlog_id => sprint.backlog.id)

    # 0 stories, so allow mark as complete
    expect { sprint.mark_as_complete }.should_not raise_error

    sprint.mark_as_incomplete
    sprint.stories << Factory.create(:story, :theme_id => theme.id)
    sprint.reload
    expect { sprint.mark_as_complete }.should raise_error ActiveRecord::RecordInvalid, /Sprint cannot be marked as complete when it contains stories that are not done/

    sprint.stories.first.sprint_story_status = done
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

    done = Factory.create(:sprint_story_status, :status => 'Done', :code => SprintStoryStatus::DONE_CODE)
    story3.sprint_story_status = done
    story3.save
    sprint.reload
    sprint.total_completed_points.should == 2 + Math.sqrt(1**2)

    story3.sprint_story.sprint_statistics.should == {
      :total_expected_points => 4*3*2,
      :total_completed_points => 2 + Math.sqrt(1**2),
      :total_allocated_points => 5 + 1 + 2 + Math.sqrt(2**2 + 1**2)
    }
  end
end
