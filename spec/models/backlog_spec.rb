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

  it 'should allow backlogs to be marked as deleted or archived' do
    backlog = Factory.create(:backlog, :name => 'Active 1')
    active2 = Factory.create(:backlog, :name => 'Active 2', :account => backlog.account)
    Factory.create(:backlog, :name => 'Archived', :account => backlog.account).mark_archived
    Factory.create(:backlog, :name => 'Deleted', :account => backlog.account).mark_deleted

    Backlog.archived(true).should include(Backlog.find_by_name('Archived'))
    Backlog.archived.first.should be_archived
    Backlog.deleted(true).should include(Backlog.find_by_name('Deleted'))
    Backlog.deleted.first.should be_deleted
    Backlog.active(true).count.should eql(2)
    Backlog.all.count.should eql(4)
    backlog.account.backlogs.active.count.should eql(2)
    backlog.account.backlogs.deleted.first.should eql(Backlog.find_by_name('Deleted'))
    backlog.account.backlogs.archived.first.should eql(Backlog.find_by_name('Archived'))

    # now mark active 2 as archived and deleted and make sure it does not appear in the archived list
    active2.mark_deleted
    active2.mark_archived
    Backlog.archived.should_not include(active2)
    Backlog.deleted.should include(active2)

    # check recover deleted
    active2.recover_deleted
    Backlog.archived(true).should include(active2)
    Backlog.deleted(true).should_not include(active2)

    # check recover archived
    active2.recover_from_archive
    Backlog.archived(true).should_not include(active2)
  end

  it 'should ensure when a backlog is destroyed all related snapshots are deleted' do
    parent = Factory.create(:backlog, :name => 'Parent')
    snapshot1 = Factory.create(:backlog, :snapshot_master_id => parent.id, :account => parent.account)
    snapshot2 = Factory.create(:backlog, :snapshot_master_id => parent.id, :account => parent.account)
    parent.destroy

    # check that snapshots have been deleted in the proces
    Backlog.where("id in (#{snapshot1.id},#{snapshot2.id})").count.should eql(0)
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

    # check that backlogs account scope is working
    @backlog.account.reload
    @backlog.account.backlogs.should_not include(@newer_snapshot)
    @backlog.account.backlogs.should_not include(@old_snapshot)
    @backlog.account.backlogs.should include(@backlog)

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

  it 'should provide a compare_with method returning a comparison object' do
    # create a simple base which has two stories, two themes, and two acceptance criterion on the first story
    @base = Factory.create(:acceptance_criterion).story.theme.backlog
    @base.themes[0].stories[0].update_attributes :score_50 => 1, :score_90 => 21, :as_a => 'As story 1'

    empty_backlog = Factory.create(:backlog)
    # compare with an empty backlog as target (newer)
    comparison = @base.compare_with(empty_backlog)
    comparison.themes.first.should be_deleted
    comparison.themes.first.stories.first.should be_deleted
    comparison.themes.first.stories.first.acceptance_criteria.first.should be_deleted

    # compare with an empty backlog as base (older)
    comparison = empty_backlog.compare_with(@base)
    comparison.themes.first.should be_new
    comparison.themes.first.stories.first.should be_new
    comparison.themes.first.stories.first.acceptance_criteria.first.should be_new

    # add two additional criterion to the base, one story and one theme to index 0 of theme, story and backlog
    Factory.create(:acceptance_criterion, :story => @base.themes.first.stories.first)
    Factory.create(:acceptance_criterion, :story => @base.themes.first.stories.first)
    Factory.create(:story, :theme => @base.themes.first, :as_a => 'As story 2')
    Factory.create(:theme, :backlog => @base)

    # base is typically the older version
    # target is typically the newer version so we can see the changes
    @target = Factory.create(:backlog)
    @base.copy_children_to_backlog(@target)

    # we now have two identical objects, check they are identical before we embark on a complete test suite
    comparison = @base.compare_with(@target)
    comparison.should be_identical
    comparison.themes.count.should eql(2) # 1 by default plus additional one added
    comparison.themes.first.should be_identical
    comparison.themes.first.stories.count.should eql(2) # 1 by default plus additional one
    comparison.themes.first.stories.first.should be_identical
    comparison.themes.first.stories.first.acceptance_criteria.count.should eql(3) # 1 by default plus additional one
    comparison.themes.first.stories.first.acceptance_criteria.first.should be_identical

    # backlog changes
    @target.update_attributes :rate => @target.rate + 100, :velocity => @target.velocity - 0.1
    @target.reload
    comparison = @base.compare_with(@target)
    comparison.should have_rate_changed
    comparison.should have_rate_increased
    comparison.should have_velocity_changed
    comparison.should have_velocity_decreased
    comparison.themes[0].should have_days_changed
    comparison.themes[0].should have_days_increased # velocity has decreased so days should have gone up
    comparison.themes[0].should have_cost_changed
    comparison.themes[0].should have_cost_increased # rate has increase so cost should have gone up
    # reset so that other comparisons aren't effected
    @target.update_attributes :rate => @target.rate - 100, :velocity => @target.velocity + 0.1
    @target.reload

    # now make some changes to the object
    # theme changes
    base_theme_name = @base.themes[0].name
    @target.themes[1].destroy # remove the second theme in target
    Factory.create(:theme, :backlog => @target) # create a new theme in target
    @target.themes[0].update_attributes :name => 'Changed the name' # change theme 0
    @target.reload
    # check theme changes
    comparison = @base.compare_with(@target)
    comparison.themes.count.should eql(3)
    comparison.themes[1].should be_deleted
    comparison.themes[0].target.name.should eql('Changed the name')
    comparison.themes[0].base.name.should eql(base_theme_name)
    comparison.themes[0].should_not be_identical
    comparison.themes[0].should have_changed
    comparison.themes[0].should have_name_changed
    comparison.themes[0].should_not be_identical
    comparison.themes[2].should be_new

    # story changes
    story_3 = Factory.create(:story, :theme => @target.themes[0], :as_a => 'As story 3') # create a new story in target
    story_4 = Factory.create(:story, :theme => @target.themes[0], :as_a => 'As story 4') # create a new story in target
    story_5 = Factory.create(:story, :theme => @target.themes[0], :as_a => 'As story 5') # create a new story in target
    story_4.move_to_bottom # this should be listed as the last story in target collection
    @target.themes[0].stories[1].destroy # remove the second existing story in target, now index 1 will be the new item from above
    @target.themes[0].stories[0].as_a = 'Changed the as_a field' # change the as_a field in 2nd story of 1st theme
    @target.themes[0].stories[0].comments = 'Changed the as_a field' # change the as_a field in 2nd story of 1st theme
    @target.themes[0].stories[0].score_50 = 5 # increase the score 50 value
    @target.themes[0].stories[0].score_90 = 13 # reduce the score 50 value
    @target.themes[0].stories[0].save!
    @target.reload
    # check story changes
    comparison = @base.compare_with(@target)
    theme = comparison.themes[0] # all changes are in theme 0 so lets focus on that
    @target.themes[0].stories(true).count.should eql(4) # 2 original - 1 removed + 3 new ones
    theme.stories.count.should eql(5) # 2 original stories + 1 removed + 3 new ones in comparator
    theme.stories[0].should_not be_identical
    theme.stories[0].should have_as_a_changed
    theme.stories[0].should_not have_i_want_to_changed
    theme.stories[0].should_not have_so_i_can_changed
    theme.stories[0].should have_score_50_changed
    theme.stories[0].should have_score_50_increased
    theme.stories[0].should have_score_90_changed
    theme.stories[0].should have_score_90_decreased
    theme.stories[0].should have_comments_changed
    theme.stories[1].should be_deleted
    theme.stories[2].target.should eql(story_3) # check that order has been respected in new items
    theme.stories[3].should be_new
    theme.stories[4].target.should eql(story_4) # check that order has been respected in new items

    # acceptance criterion changes
    criterion_bottom = Factory.create(:acceptance_criterion, :story => @target.themes[0].stories[0], :criterion => 'Changed this criterion') # create a new criterion in target
    criterion_top = Factory.create(:acceptance_criterion, :story => @target.themes[0].stories[0], :criterion => 'Changed this criterion')
    criterion_top.move_to_top # criterion matched on content, so ordering should be ignored
    @target.themes[0].stories[0].acceptance_criteria[1].destroy # remove the second criterion in target
    @target.reload
    # check criterion changes
    comparison = @base.compare_with(@target)
    criteria = comparison.themes[0].stories[0].acceptance_criteria # all changes are in theme 0, story 0 so lets focus on that
    criteria.count.should eql(5) # 3 initials, just destroyed one which is now blank plus added two
    criteria[0].should be_identical # first items are identical as text matches
    criteria[0].should_not have_criterion_changed
    criteria[1].should be_identical # even those index 1 was destroyed above, index 2 has the same text so should effectively take it's place
    criteria[2].should be_deleted # index 2 now has no more matches on criterion with the same default text
    criteria[3].should be_new
    criteria[3].target.should eql(criterion_top) # there are 2 new criterion, index 3 & 4, but criterion_new was moved to the top
    criteria[4].target.should eql(criterion_bottom) # there are 2 new criterion, index 3 & 4, criterion should be at the bottom as criterion_new has moved up
  end
end
