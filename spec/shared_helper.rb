def confirm_duplicate_backlogs(backlog1, backlog2)
  backlog1.object_id.should_not eql(backlog2.object_id) # make sure we're not comparing two identical objects
  backlog1.themes.count.should be > 0
  backlog1.themes.map { |t| [t.name, t.code] }.first.should eql(backlog2.themes.map { |t| [t.name, t.code] }.first)

  new_story, story = backlog1.themes.first.stories.first, backlog2.themes.first.stories.first
  [new_story.unique_id, new_story.as_a, new_story.score_90].should eql([story.unique_id, story.as_a, story.score_90])

  new_acceptance, acceptance = new_story.acceptance_criteria.first, story.acceptance_criteria.first
  [new_acceptance.criterion].should eql([acceptance.criterion])
end

def assert_backlog_not_editable(backlog)
  expect { backlog.themes.first.stories.first.acceptance_criteria.first.criterion = 'Changed'; backlog.save! }.to raise_error
  expect { backlog.themes.first.stories.first.acceptance_criteria.first.destroy }.to raise_error
  expect { backlog.themes.first.stories.first.as_a = 'Changed'; backlog.save! }.to raise_error
  expect { backlog.themes.first.stories.first.destroy }.to raise_error
  expect { backlog.themes.first.name = 'Changed'; backlog.save! }.to raise_error
  expect { backlog.themes.first.destroy }.to raise_error
  backlog.themes.reload.count.should eql(1)
  expect { backlog.name = 'Changed'; backlog.save! }.to raise_error
end