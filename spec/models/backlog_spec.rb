# encoding: UTF-8

require 'spec_helper'

describe Backlog do
  let!(:default_scoring_rule) { FactoryGirl.create(:scoring_rule_default) }
  let!(:default_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE) }
  let!(:accepted_sprint_story_status) { FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED) }

  it 'should duplicate backlog along with all related records' do
    # get a backlog set up with at least one story
    acceptance_criterion = FactoryGirl.create(:acceptance_criterion)
    @backlog = acceptance_criterion.story.theme.backlog

    # new backlog with no stories or themes
    @new_backlog = FactoryGirl.create(:backlog)

    @backlog.copy_children_to_backlog(@new_backlog)
    @backlog.reload
    @new_backlog.reload

    confirm_duplicate_backlogs @new_backlog, @backlog
  end

  it 'should ensure days and costs are accurate based on the themes' do
    backlog = FactoryGirl.create(:backlog, :rate => 800, :velocity => 3)
    theme = FactoryGirl.create(:theme, :backlog => backlog)
    FactoryGirl.create(:story, :theme => theme, :score_50 => 5, :score_90 => 8)
    FactoryGirl.create(:story, :theme => theme, :score_50 => 1, :score_90 => 2)
    FactoryGirl.create(:story, :theme => theme, :score_50 => 3, :score_90 => 3)
    theme2 = FactoryGirl.create(:theme, :backlog => backlog)
    FactoryGirl.create(:story, :theme => theme2, :score_50 => 1, :score_90 => 2)

    backlog.points.should be_within(0.01).of(14.16)
    backlog.days.should be_within(0.1).of(4.72)
    backlog.cost.should be_within(1).of(3776)
    backlog.cost_formatted.should eql('£3,777')
  end

  it 'should update meta data' do
    backlog = nil
    Timecop.freeze(Time.now - 1.day) do
      backlog = FactoryGirl.create(:backlog)
    end
    Timecop.freeze(Time.now) do
      user = FactoryGirl.create(:user)
      backlog.update_meta_data user
      backlog.updated_at.utc.to_s.should eql(Time.now.utc.to_s)
      backlog.last_modified_user.should eql(user)
    end
  end

  context 'deleting and archiving' do
    it 'should allow backlogs to be marked as deleted or archived' do
      backlog = FactoryGirl.create(:backlog, :name => 'Active 1')
      active2 = FactoryGirl.create(:backlog, :name => 'Active 2', :account => backlog.account)
      FactoryGirl.create(:backlog, :name => 'Archived', :account => backlog.account).mark_archived
      FactoryGirl.create(:backlog, :name => 'Deleted', :account => backlog.account).mark_deleted

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
  end

  context 'destroying' do
    it 'should ensure when a backlog is destroyed all related snapshots are deleted' do
      parent = FactoryGirl.create(:backlog, :name => 'Parent')
      snapshot1 = FactoryGirl.create(:backlog, :snapshot_master_id => parent.id, :account => parent.account)
      snapshot2 = FactoryGirl.create(:backlog, :snapshot_master_id => parent.id, :account => parent.account)
      parent.destroy

      # check that snapshots have been deleted in the process
      Backlog.where("id in (#{snapshot1.id},#{snapshot2.id})").count.should eql(0)
    end

    it 'should ensure when a backlog is destroyed all related themes and sprints are destroyed too' do
      backlog = FactoryGirl.create(:backlog, :with_sprints, :with_stories)
      sprint = backlog.sprints.last
      theme = backlog.themes.last
      backlog.destroy

      Sprint.find_by_id(sprint.id).should be_blank
      Theme.find_by_id(theme.id).should be_blank
    end

    it 'should allow archived deleted backlogs to be destroyed' do
      backlog = FactoryGirl.create(:backlog)
      backlog.mark_archived
      backlog.mark_deleted
      Backlog.find_by_id(backlog.id).should be_present
      backlog.destroy
      Backlog.find_by_id(backlog.id).should be_blank
    end

    it 'should allow normal deleted backlogs to be destroyed' do
      backlog = FactoryGirl.create(:backlog)
      backlog.mark_deleted
      Backlog.find_by_id(backlog.id).should be_present
      backlog.destroy
      Backlog.find_by_id(backlog.id).should be_blank
    end

    it 'should allow deleted manual snapshots to be destroyed' do
      backlog = FactoryGirl.create(:backlog, :with_sprints, :with_stories)
      snapshot = backlog.create_snapshot('Manual snapshot')
      snapshot.mark_deleted
      Backlog.find_by_id(snapshot.id).should be_present
      snapshot.destroy
      Backlog.find_by_id(snapshot.id).should be_blank
    end

    it 'should allow deleted manual snapshots to be destroyed' do
      backlog = FactoryGirl.create(:backlog, :with_sprints, :with_stories)
      snapshot = backlog.sprints.last.create_snapshot_if_missing
      snapshot.mark_deleted
      Backlog.find_by_id(snapshot.id).should be_present
      snapshot.destroy
      Backlog.find_by_id(snapshot.id).should be_blank
    end
  end

  context 'editable and destroyable' do
    it 'should not be editable or destroyable if a sprint backlog' do
      backlog = FactoryGirl.create(:backlog, :with_sprints, :with_stories)
      sprint_snapshot = backlog.sprints.last.create_snapshot_if_missing

      assert_backlog_not_editable sprint_snapshot
    end

    it 'should not be editable or destroyable if a manual backlog' do
      backlog = FactoryGirl.create(:backlog, :with_sprints, :with_stories)
      manual_snapshot = backlog.create_snapshot('snapshot name')

      assert_backlog_not_editable manual_snapshot
    end

    it 'should be editable if the backlog has a not_ready_since date set' do
      backlog = FactoryGirl.create(:backlog, :with_sprints, :with_stories, :with_a_snapshot)
      snapshot = backlog.snapshots.first
      assert_backlog_not_editable snapshot
      snapshot.reload
      snapshot.update_attribute :not_ready_status, 'Updating'
      snapshot.update_attribute :not_ready_since, Time.now
      snapshot.update_attributes name: 'Testing name can be changed'
      snapshot.name.should == 'Testing name can be changed'
    end
  end

  it 'should allow a backlog snapshot to be created' do
    acceptance_criterion = FactoryGirl.create(:acceptance_criterion)
    @backlog = acceptance_criterion.story.theme.backlog

    # create two snapshots in the future and check they are proper duplicates
    Timecop.freeze(Time.now + 1.day) do
      @old_snapshot = @backlog.create_snapshot('First snapshot')
      confirm_duplicate_backlogs @old_snapshot, @backlog.reload
    end
    Timecop.freeze(Time.now + 2.day) do
      @newer_snapshot = @backlog.create_snapshot('Second snapshot')
      confirm_duplicate_backlogs @newer_snapshot, @backlog.reload
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
    assert_backlog_not_editable @newer_snapshot

    # check that both snapshots still reference the original correctly
    @old_snapshot.snapshot_master.should eql(@backlog)
    @newer_snapshot.snapshot_master.should eql(@backlog)
  end

  context 'snapshots created asynchronously' do
    let(:acceptance_criterion) { FactoryGirl.create(:acceptance_criterion) }
    let(:subject) { acceptance_criterion.story.theme.backlog }

    after { BacklogWorker::CopyChildrenToBacklog.rspec_reset }

    it 'should use the BacklogWorker::CopyChildrenToBacklog' do
      BacklogWorker::CopyChildrenToBacklog.should_receive(:perform)
      subject.create_snapshot('new', async: true)
    end

    it 'should return the new snapshot WIP whilst asynchronously copying children' do
      BacklogWorker::CopyChildrenToBacklog.stub(:perform_async)
      new_snapshot = subject.create_snapshot('new', async: true)
      new_snapshot.should_not be_changed
      new_snapshot.name.should == 'new'
    end
  end

  it 'should provide a compare_with method returning a comparison object' do
    # create a simple base which has two stories, two themes, and two acceptance criterion on the first story
    @base = FactoryGirl.create(:acceptance_criterion).story.theme.backlog
    @base.themes[0].stories[0].update_attributes :score_50 => 1, :score_90 => 21, :as_a => 'As story 1'

    empty_backlog = FactoryGirl.create(:backlog)
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
    FactoryGirl.create(:acceptance_criterion, :story => @base.themes.first.stories.first)
    FactoryGirl.create(:acceptance_criterion, :story => @base.themes.first.stories.first)
    FactoryGirl.create(:story, :theme => @base.themes.first, :as_a => 'As story 2')
    FactoryGirl.create(:theme, :backlog => @base)

    # base is typically the older version
    # target is typically the newer version so we can see the changes
    @target = FactoryGirl.create(:backlog)
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
    FactoryGirl.create(:theme, :backlog => @target) # create a new theme in target
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
    story_3 = FactoryGirl.create(:story, :theme => @target.themes[0], :as_a => 'As story 3') # create a new story in target
    story_4 = FactoryGirl.create(:story, :theme => @target.themes[0], :as_a => 'As story 4') # create a new story in target
    story_5 = FactoryGirl.create(:story, :theme => @target.themes[0], :as_a => 'As story 5') # create a new story in target
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
    criterion_bottom = FactoryGirl.create(:acceptance_criterion, :story => @target.themes[0].stories[0], :criterion => 'Changed this criterion') # create a new criterion in target
    criterion_top = FactoryGirl.create(:acceptance_criterion, :story => @target.themes[0].stories[0], :criterion => 'Changed this criterion')
    criterion_top.move_to_top # criterion matched on content, so ordering should be ignored
    @target.themes[0].stories[0].acceptance_criteria[1].destroy # remove the second criterion in target
    @target.reload
    # check criterion changes
    comparison = @base.compare_with(@target)
    criteria = comparison.themes[0].stories[0].acceptance_criteria # all changes are in theme 0, story 0 so lets focus on that
    criteria.count.should eql(5) # 3 initials, just destroyed one which is now blank plus added two
    criteria[0].should be_identical # first items are identical as text matches
    criteria[0].should_not have_criterion_changed
    criteria[1].should be_deleted # index 2 now has no more matches on criterion with the same default text
    criteria[2].should be_identical
    criteria[3].should be_new
    criteria[3].target.should eql(criterion_top) # there are 2 new criterion, index 3 & 4, but criterion_new was moved to the top
    criteria[4].target.should eql(criterion_bottom) # there are 2 new criterion, index 3 & 4, criterion should be at the bottom as criterion_new has moved up
  end

  it 'should return a list of sprint snapshots in descending order' do
    backlog = FactoryGirl.create(:backlog)
    sprints = (1..3).map { |d| FactoryGirl.create(:sprint, :backlog => backlog) }
    sprints.first.create_snapshot_if_missing
    sprints.second.create_snapshot_if_missing
    backlog.reload

    # all snapshots should be returned in decsending order, sprint 3 should not be returned as no snapshot created
    backlog.sprint_snapshots.first.name.should == 'Sprint 2'
    backlog.sprint_snapshots.second.name.should == 'Sprint 1'
  end

  it 'should return an average velocity based on completed sprints' do
    theme = FactoryGirl.create(:theme)
    backlog = theme.backlog
    backlog.velocity = 4
    backlog.save!

    # until we have a complete sprint, average should just return backlog settings
    backlog.average_velocity.should == 4

    # create 3 sprints with a single story with a score of 1, 2, and 3
    (1..3).each do |score|
      sprint = FactoryGirl.create(:sprint, :backlog => backlog, :duration_days => 1, :number_team_members => 1)
      story = FactoryGirl.create(:story, :score_50 => score, :score_90 => score)
      sprint.stories << story
      story.sprint_story.sprint_story_status = accepted_sprint_story_status
      story.sprint_story.save!
      sprint.reload
      sprint.mark_as_complete
    end

    backlog.average_velocity.should == 2 # average of 1,2,3
  end

  context 'Account defaults' do
    let(:account) { FactoryGirl.create(:account) }

    it 'should not update account defaults if backlog if prohibit_account_updates is set' do
      account.defaults_set.should be_blank
      backlog = FactoryGirl.build(:backlog, :account => account, :velocity => 1, :rate => 2)
      backlog.prohibit_account_updates = true
      backlog.save!
      account.reload
      account.defaults_set.should be_blank
    end

    it 'should not update account defaults if backlog is assigned to a company' do
      account.defaults_set.should be_blank
      backlog = FactoryGirl.build(:backlog, :account => account, :velocity => 1, :rate => 2, :company => FactoryGirl.create(:company, :account => account))
      backlog.save!
      account.reload
      account.defaults_set.should be_blank
    end

    it 'should update account defaults if backlog if prohibit_account_updates is not set' do
      account.defaults_set.should be_blank
      FactoryGirl.create(:backlog, :account => account, :velocity => 1, :rate => 2)
      account.reload
      account.defaults_set.should be_true
      account.default_velocity.to_i.should == 1
      account.default_rate.to_i.should == 2
    end
  end

  context 'Scoring rule' do
    it 'should update the account scoring rule if one is not set' do
      backlog = FactoryGirl.create(:backlog)
      account = backlog.account
      scoring_rule_fib = FactoryGirl.create(:scoring_rule_fib)
      scoring_rule_any = FactoryGirl.create(:scoring_rule_any)

      backlog.scoring_rule_id.should be_blank
      account.scoring_rule_id.should be_blank

      backlog.update_attributes :scoring_rule_id => scoring_rule_fib.id

      backlog.scoring_rule.should == scoring_rule_fib
      account.scoring_rule.should == scoring_rule_fib

      # now when we update, account should not be updated as it already has a default
      backlog.update_attributes :scoring_rule_id => scoring_rule_any.id
      backlog.scoring_rule.should == scoring_rule_any
      account.scoring_rule.should == scoring_rule_fib
    end

    it 'should have a default scoring system even when no scoring system has been selected' do
      backlog = FactoryGirl.create(:backlog)

      # check backlog does not actually have a scoring rule set
      backlog.scoring_rule_id.should be_blank
      backlog.scoring_rule.should == default_scoring_rule
    end

    it 'should inherit the scoring rule from the account if no scoring rule for this backlog exists' do
      scoring_rule_fib = FactoryGirl.create(:scoring_rule_fib)

      backlog = FactoryGirl.create(:backlog)
      account = backlog.account

      backlog.scoring_rule.should == default_scoring_rule

      account.update_attributes :scoring_rule_id => scoring_rule_fib.id

      backlog.scoring_rule.should == scoring_rule_fib
    end

    it 'should return a list of valid scoring rules when anything other than any is selected' do
      backlog = FactoryGirl.create(:backlog, :scoring_rule_id => FactoryGirl.create(:scoring_rule_fib).id)
      backlog.valid_scores.should include(1,2,3)
      backlog.valid_scores.should_not include(4)
    end

    it 'should return nil when scoring rule is any' do
      backlog = FactoryGirl.create(:backlog, :scoring_rule_id => FactoryGirl.create(:scoring_rule_any).id)
      backlog.valid_scores.should be_blank
    end
  end


  it 'should only allow a rate if velocity is present' do
    expect { FactoryGirl.create(:backlog, :rate => 50, :velocity => nil)}.to raise_error ActiveRecord::RecordInvalid, /Rate cannot be specified if velocity is empty/

    backlog = FactoryGirl.create(:backlog, :rate => 50, :velocity => 5)
    backlog.rate.should == 50
  end

  it 'should trigger sprints to change from calculated velocity to explicit velocity when velocity p/day nilled in backlog settings' do
    # set up two stories
    story = FactoryGirl.create(:story)
    story2 = FactoryGirl.create(:story, :theme => story.theme)
    backlog = story.theme.backlog

    # assign stories to a completed sprint
    completed_sprint = FactoryGirl.create(:sprint, :backlog => backlog, :number_team_members => 5)
    [story, story2].each do |story|
      completed_sprint.stories << story
      story.reload
      story.sprint_story_status = accepted_sprint_story_status
    end
    completed_sprint.mark_as_complete
    completed_sprint_points = completed_sprint.total_expected_points

    # set up an imcomplete sprint with a different expected velocity based on number team members
    incomplete_sprint = FactoryGirl.create(:sprint, :backlog => backlog, :number_team_members => 20)
    incomplete_sprint_points = incomplete_sprint.total_expected_points

    # remove velocity for backlog, which should trigger updates to sprints so that explicit velocities are set based on the old backlog velocity
    backlog.update_attributes :velocity => nil, :rate => nil

    completed_sprint.reload
    completed_sprint.total_expected_points.should == completed_sprint_points
    completed_sprint.explicit_velocity.should == completed_sprint_points

    incomplete_sprint.reload
    incomplete_sprint.total_expected_points.should == incomplete_sprint_points
    incomplete_sprint.explicit_velocity.should == incomplete_sprint_points
  end

  it 'should not change sprint settings when backlog settings change back to average velocity per day setting' do
    # set up a backlog with a sprint with explicit velocity set
    backlog = FactoryGirl.create(:backlog, :velocity => nil, :rate => nil)
    sprint = FactoryGirl.create(:sprint, :backlog => backlog, :explicit_velocity => 7, :number_team_members => nil)

    # now set to use velocity calculations for the backlog
    backlog.update_attributes :velocity => 5

    sprint.reload
    sprint.explicit_velocity.should == 7
    sprint.total_expected_points.should == 7
  end

  it 'should remove the rate when velocity for sprint is empty' do
    backlog = FactoryGirl.create(:backlog, :rate => 50, :velocity => 5)
    backlog.rate.should == 50

    backlog.update_attributes :velocity => nil, :rate => nil
    backlog.rate.should == nil
  end

  it 'should be cost estimatable and velocity estimatable' do
    backlog = FactoryGirl.create(:backlog, :rate => 50, :velocity => 5)
    backlog.should be_cost_estimatable
    backlog.should be_days_estimatable
  end

  it 'should be velocity estimatable and not cost estimatable' do
    backlog = FactoryGirl.create(:backlog, :rate => nil, :velocity => 5)
    backlog.should be_days_estimatable
    backlog.should_not be_cost_estimatable
  end

  it 'should not be cost estimatable and not velocity estimatable' do
    backlog = FactoryGirl.create(:backlog, :rate => nil, :velocity => nil)
    backlog.should_not be_days_estimatable
    backlog.should_not be_cost_estimatable
  end

  context 'JSON and XML representations' do
    it 'should not contain snapshots fields if a backlog master' do
      json = FactoryGirl.create(:backlog).as_json
      json.keys.should_not include(:snapshot_master_id, :snapshot_for_sprint_id, :deleted, :parent_backlog_id, :parent_sprint_id)
    end

    it 'should include a reference to the parent backlog ID if a manual snapshot' do
      backlog = FactoryGirl.create(:backlog)
      snapshot = backlog.create_snapshot('acme')
      json = snapshot.as_json
      json.keys.should_not include(:snapshot_master_id, :snapshot_for_sprint_id, :deleted, :parent_sprint_id)
      json.keys.should_not include(:account_id, :company_id, :archived, :author_id, :last_modified_user_id, :updated_at)
      json.keys.should include(:parent_backlog_id)
    end

    it 'should include a reference to the parent sprint ID if a sprint snapshot' do
      sprint = FactoryGirl.create(:sprint)
      snapshot = sprint.create_snapshot_if_missing
      json = snapshot.as_json
      json.keys.should_not include(:snapshot_master_id, :snapshot_for_sprint_id, :deleted, :parent_backlog_id)
      json.keys.should_not include(:account_id, :company_id, :archived, :author_id, :last_modified_user_id, :updated_at)
      json.keys.should include(:parent_sprint_id)
    end
  end

  describe '#where_user_has_access' do
    subject { account.backlogs.where_user_has_access(user) }
    let(:account) { FactoryGirl.create(:account) }
    let(:company) { FactoryGirl.create(:company, :account => account) }
    let(:backlog) { FactoryGirl.create(:backlog, :account => account) }
    let(:backlog_for_company) { FactoryGirl.create(:backlog, :account => account, :company => company) }
    let(:user) { FactoryGirl.create(:user) }

    context 'user is an administrator and should always have access to all backlogs' do
      before (:each) do
        # set user as admin
        account.add_first_user user
      end

      it 'should return backlogs where the admin user has read privileges at account level' do
        account.account_users.first.update_attribute :privilege, 'read'
        subject.should include(backlog)
      end

      it 'should return backlogs where the admin user has none privileges at account level' do
        account.account_users.first.update_attribute :privilege, 'none'
        subject.should include(backlog)
      end

      it 'should return backlogs where the admin user has inherited privileges at company level' do
       subject.should include(backlog_for_company)
      end

      it 'should return backlogs where the admin user has none privileges at company level' do
        company.add_or_update_user user, :none
        subject.should include(backlog_for_company)
      end

      it 'should return backlogs where the admin user has none privileges at backlog level' do
        backlog.add_or_update_user user, :none
        subject.should include(backlog)
      end
    end

    context 'account no level permissions are set' do
      before (:each) { account.add_user user, 'none' }

      context 'and no company permissions are set' do
        it 'should not return any backlogs' do
          subject.should be_blank
        end
      end

      context 'and company none permissions are set' do
        before (:each) { company.add_or_update_user user, :none }
        it 'should not return any backlogs' do
          subject.should be_blank
        end
      end

      context 'and company read permissions are set' do
        before (:each) { company.add_or_update_user user, :read }
        it 'should return the backlog for the company' do
          subject.should include(backlog_for_company)
          subject.should_not include(backlog)
        end
      end

      context 'and company read permissions are set and backlog none permissions are set' do
        before (:each) do
          company.add_or_update_user user, :read
          backlog_for_company.add_or_update_user user, :none
        end
        it 'should not return any backlogs' do
          subject.should be_blank
        end
      end

      context 'and company none permissions are set and backlog read permissions are set for backlog within company' do
        before (:each) do
          company.add_or_update_user user, :none
          backlog_for_company.add_or_update_user user, :read
        end
        it 'should return the backlog with company' do
          subject.should include(backlog_for_company)
          subject.should_not include(backlog)
        end
      end

      context 'and backlog read permissions are set for backlog without company' do
        before (:each) do
          backlog.add_or_update_user user, :read
        end
        it 'should return the backlog with company' do
          subject.should include(backlog)
          subject.should_not include(backlog_for_company)
        end
      end
    end

    context 'account read level permissions are set' do
      before (:each) { account.add_user user, 'read' }

      context 'and no company permissions are set' do
        it 'should not return any backlogs' do
          subject.should include(backlog, backlog_for_company)
        end
      end

      context 'and company none permissions are set' do
        before (:each) { company.add_or_update_user user, :none }
        it 'should not return backlog with explicit company none permissions' do
          subject.should include(backlog)
          subject.should_not include(backlog_for_company)
        end
      end

      context 'and company read permissions are set' do
        before (:each) { company.add_or_update_user user, :read }
        it 'should return all backlogs' do
          subject.should include(backlog, backlog_for_company)
        end
      end

      context 'and backlog without company none permissions are set' do
        before (:each) { backlog.add_or_update_user user, :none }
        it 'should not return backlog with company without explicit none permissions set' do
          subject.should include(backlog_for_company)
          subject.should_not include(backlog)
        end
      end

      context 'and backlog with company read permissions has backlog none permissions set' do
        before (:each) do
          company.add_or_update_user user, :read
          backlog_for_company.add_or_update_user user, :none
        end
        it 'should not return backlog with company' do
          subject.should include(backlog)
          subject.should_not include(backlog_for_company)
        end
      end
    end
  end

  context 'backlog_users' do
    let(:account) { FactoryGirl.create(:account) }
    let(:user) { FactoryGirl.create(:user) }
    subject { FactoryGirl.create(:backlog, :account => account) }

    describe '#delete_user' do
      it 'should delete the backlog user that exists' do
        FactoryGirl.create(:backlog_user, :backlog => subject, :user => user)
        subject.backlog_users.map(&:user).should include(user)
        subject.delete_user user
        subject.reload
        subject.backlog_users.map(&:user).should_not include(user)
      end

      it 'should not fail if delete is called without any backlog user' do
        subject.delete_user user
        subject.backlog_users.map(&:user).should_not include(user)
      end
    end

    describe '#add_or_update_user' do
      it 'should update the existing user when one exists' do
        FactoryGirl.create(:backlog_user_with_no_rights, :backlog => subject, :user => user)
        subject.backlog_users.map(&:user).should include(user)
        subject.add_or_update_user user, :full
        subject.reload
        subject.backlog_users.map(&:user).should include(user)
        subject.backlog_users.first.privilege.should == Privilege.find(:full)
      end

      it 'should add a new user when one does not exist' do
        subject.add_or_update_user user, :read
        subject.reload
        subject.backlog_users.map(&:user).should include(user)
        subject.backlog_users.first.privilege.should == Privilege.find(:read)
      end
    end
  end

  context 'locale' do
    let(:account_locale) { FactoryGirl.create(:locale) }
    let(:company_locale) { FactoryGirl.create(:locale) }
    let(:other_locale) { FactoryGirl.create(:locale) }
    let(:account) { FactoryGirl.create(:account, locale: account_locale) }

    context 'inheriting from company' do
      let(:company) { FactoryGirl.create(:company, account: account, locale: company_locale) }
      subject { FactoryGirl.create(:backlog, company: company, account: account, locale: nil) }

      it 'should inherit from the company if not set at a backlog level' do
        subject.locale.should == company_locale
        subject.locale_id.should == nil
      end

      it 'should use the set locale if chosen' do
        subject.locale = other_locale
        subject.locale.should == other_locale
        subject.locale_id.should == other_locale.id
      end

      it 'should allow the locale to be set to nil and thus inherit from company' do
        subject.locale = other_locale
        subject.locale = nil
        subject.locale.should == company_locale
      end

      it 'should inherit from the account if company locale is set to nil' do
        company.locale = nil
        subject.locale.should == account_locale
        subject.locale_id.should == nil
      end

      it 'should always provide access to default locale' do
        subject.default_locale.should == company_locale
        subject.locale = other_locale
        subject.default_locale.should == company_locale
      end
    end

    context 'inheriting from account without a company' do
      subject { FactoryGirl.create(:backlog, company: nil, account: account, locale: nil) }

      it 'should inherit from the account if not set at a backlog level' do
        subject.locale.should == account_locale
        subject.locale_id.should == nil
      end

      it 'should use the set locale if chosen' do
        subject.locale = other_locale
        subject.locale.should == other_locale
        subject.locale_id.should == other_locale.id
      end

      it 'should always provide access to default locale' do
        subject.default_locale.should == account_locale
        subject.locale = other_locale
        subject.default_locale.should == account_locale
      end
    end
  end
end
