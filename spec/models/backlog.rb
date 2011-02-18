require 'spec_helper'

describe Backlog do
  it 'should duplicate backlog along with all related records' do
    # get a backlog set up with at least one story
    acceptance_criterion = Factory.create(:acceptance_criterion)
    backlog = acceptance_criterion.story.theme.backlog

    new_backlog = Factory.create(:backlog)
    backlog.copy_children_to_backlog(new_backlog)

    new_backlog.themes.map { |t| [t.name, t.code, t.position] }.first.should eql(backlog.themes.map { |t| [t.name, t.code, t.position] }.first)

    new_story, story = new_backlog.themes.first.stories.first, backlog.themes.first.stories.first
    [new_story.unique_id, new_story.as_a, new_story.score_90].should eql([story.unique_id, story.as_a, story.score_90])

    new_acceptance, acceptance = new_story.acceptance_criteria.first, story.acceptance_criteria.first
    [new_acceptance.position, new_acceptance.criterion].should eql([acceptance.position, acceptance.criterion])
  end
end
