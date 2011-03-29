# encoding: UTF-8

require 'spec_helper'

describe Backlog do
  def confirm_duplicates(backlog1, backlog2)
    backlog1.object_id.should_not eql(backlog2.object_id) # make sure we're not comparing two identical objects
    backlog1.themes.count.should be > 0
    backlog1.themes.map { |t| [t.name, t.code] }.first.should eql(backlog2.themes.map { |t| [t.name, t.code] }.first)

    new_story, story = backlog1.themes.first.stories.first, backlog2.themes.first.stories.first
    [new_story.unique_id, new_story.as_a, new_story.score_90].should eql([story.unique_id, story.as_a, story.score_90])

    new_acceptance, acceptance = new_story.acceptance_criteria.first, story.acceptance_criteria.first
    [new_acceptance.criterion].should eql([acceptance.criterion])
  end

  it 'should duplicate backlog along with all related records' do
    # get a backlog set up with at least one story
    acceptance_criterion = Factory.create(:acceptance_criterion)
    @backlog = acceptance_criterion.story.theme.backlog

    # new backlog with no stories or themes
    @new_backlog = Factory.create(:backlog)

    @backlog.copy_children_to_backlog(@new_backlog)
    @backlog.reload
    @new_backlog.reload

    confirm_duplicates @new_backlog, @backlog
  end

  it 'should ensure days and costs are accurate based on the themes' do
    backlog = Factory.create(:backlog, :rate => 800, :velocity => 3)
    theme = Factory.create(:theme, :backlog => backlog)
    Factory.create(:story, :theme => theme, :score_50 => 5, :score_90 => 8)
    Factory.create(:story, :theme => theme, :score_50 => 1, :score_90 => 2)
    Factory.create(:story, :theme => theme, :score_50 => 3, :score_90 => 3)
    theme2 = Factory.create(:theme, :backlog => backlog)
    Factory.create(:story, :theme => theme2, :score_50 => 1, :score_90 => 2)

    backlog.points.should be_within(0.01).of(14.16)
    backlog.days.should be_within(0.1).of(4.72)
    backlog.cost.should be_within(1).of(3776)
    backlog.cost_formatted.should eql('£3,777')
  end

  it 'should update meta data' do
    backlog = nil
    Timecop.freeze(Time.now - 1.day) do
      backlog = Factory.create(:backlog)
    end
    Timecop.freeze(Time.now) do
      user = Factory.create(:user)
      backlog.update_meta_data user
      backlog.updated_at.utc.to_s.should eql(Time.now.utc.to_s)
      backlog.last_modified_user.should eql(user)
    end
  end

  it 'should allow a backlog snapshot to be created' do
    acceptance_criterion = Factory.create(:acceptance_criterion)
    @backlog = acceptance_criterion.story.theme.backlog

    # create two snapshots in the future and check they are proper duplicates
    Timecop.freeze(Time.now + 1.day) do
      @old_snapshot = @backlog.create_snapshot('First snapshot')
      confirm_duplicates @old_snapshot, @backlog.reload
    end
    Timecop.freeze(Time.now + 2.day) do
      @newer_snapshot = @backlog.create_snapshot('Second snapshot')
      confirm_duplicates @newer_snapshot, @backlog.reload
    end

    # check that backlogs company scope is working
    @backlog.company.reload
    @backlog.company.backlogs.should_not include(@newer_snapshot)
    @backlog.company.backlogs.should_not include(@old_snapshot)
    @backlog.company.backlogs.should include(@backlog)

    # check that backlog snapshots is working
    @backlog.reload
    @backlog.snapshots.should include(@old_snapshot)
    @backlog.snapshots.should include(@newer_snapshot)
    @backlog.snapshots.should_not include(@backlog)

    # check that order of snapshots is in descending order
    @backlog.snapshots[0].should eql(@newer_snapshot)
    @backlog.snapshots[1].should eql(@old_snapshot)

    # check that snapshots are not editable
    @newer_snapshot.reload
    expect { @newer_snapshot.themes.first.stories.first.acceptance_criteria.first.criterion = 'Changed'; @newer_snapshot.save! }.to raise_error
    expect { @newer_snapshot.themes.first.stories.first.acceptance_criteria.first.destroy }.to raise_error
    expect { @newer_snapshot.themes.first.stories.first.as_a = 'Changed'; @newer_snapshot.save! }.to raise_error
    expect { @newer_snapshot.themes.first.stories.first.destroy }.to raise_error
    expect { @newer_snapshot.themes.first.name = 'Changed'; @newer_snapshot.save! }.to raise_error
    expect { @newer_snapshot.themes.first.destroy }.to raise_error
    @newer_snapshot.themes.reload.count.should eql(1)
    expect { @newer_snapshot.name = 'Changed'; @newer_snapshot.save! }.to raise_error

    # check that both snapshots still reference the original correctly
    @old_snapshot.snapshot_master.should eql(@backlog)
    @newer_snapshot.snapshot_master.should eql(@backlog)
  end
end
