require 'spec_helper'

describe Backlog do
  it 'should duplicate backlog along with all related records' do
    # get a backlog set up with at least one story
    acceptance_criterion = Factory.create(:acceptance_criterion)
    new_backlog = Factory.create(:backlog)
    backlog = acceptance_criterion.story.theme.backlog(true)

    backlog.copy_children_to_backlog(new_backlog)

    new_backlog.themes.map { |t| [t.name, t.code, t.position] }.first.should eql(backlog.themes.map { |t| [t.name, t.code, t.position] }.first)

    new_story, story = new_backlog.themes.first.stories.first, backlog.themes.first.stories.first
    [new_story.unique_id, new_story.as_a, new_story.score_90].should eql([story.unique_id, story.as_a, story.score_90])

    new_acceptance, acceptance = new_story.acceptance_criteria.first, story.acceptance_criteria.first
    [new_acceptance.position, new_acceptance.criterion].should eql([acceptance.position, acceptance.criterion])
  end

  it 'should ensure days and costs are accurate based on the themes' do
    backlog = Factory.create(:backlog, :rate => 800, :velocity => 3)
    theme = Factory.create(:theme, :backlog => backlog)
    story = Factory.create(:story, :theme => theme, :score_50 => 5, :score_90 => 8)
    Factory.create(:story, :theme => story.theme(true), :score_50 => 1, :score_90 => 2)
    Factory.create(:story, :theme => story.theme(true), :score_50 => 3, :score_90 => 3)
    theme2 = Factory.create(:theme, :backlog => backlog)
    Factory.create(:story, :theme => theme2, :score_50 => 1, :score_90 => 2)
    theme.backlog(true).days.should be_within(0.1).of(4.72)
    theme.backlog(true).cost.should be_within(1).of(3776)
  end
end
