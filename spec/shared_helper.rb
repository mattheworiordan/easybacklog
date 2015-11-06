require File.expand_path("../../lib/modules/http_status_codes", __FILE__)

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
  themes_count = backlog.themes.count
  expect { backlog.themes.first.stories.first.acceptance_criteria.first.tap { |t| t.criterion = 'Changed'; t.save! } }.to raise_error
  expect { backlog.themes.first.stories.first.acceptance_criteria.first.destroy }.to raise_error
  expect { backlog.themes.first.stories.first.tap { |t| t.as_a = 'Changed'; t.save! } }.to raise_error
  expect { backlog.themes.first.stories.first.destroy }.to raise_error
  expect { backlog.themes.first.tap { |t| t.name = 'Changed'; t.save! } }.to raise_error
  expect { backlog.themes.first.destroy }.to raise_error
  backlog.themes.reload.count.should == themes_count
  expect { backlog.name = 'Changed'; backlog.save! }.to raise_error
end

def check_unsupported_mimetypes(actions, *params)
  # take params in format :a, :b and convert to { :a => 0, :b => 0 }
  params = Hash[params.map { |d| [d, 0] }]
  %w(text/html text/plain doesnotexist).each do |mime_type|
    actions.each do |action|
      request.env['HTTP_ACCEPT'] = mime_type
      if action.match(/^index|get|list/i)
        get action.to_sym, params
      elsif action.match(/^update/i)
        put action.to_sym, params
      elsif action.match(/^delete|destroy/i)
        delete action.to_sym, params
      else
        post action.to_sym, params
      end
      response.code.should == status_code_to_string(:not_acceptable)
    end
  end
end

# API requests are treated differently in the application, typically identified by the host name, however the X-Forward-To-Api header can be used for testing
# Basic authentication request using access token set up by default
def setup_api_authentication(user_token)
  request.env['X-Forward-To-API'] = 'true'
  request.env['HTTP_AUTHORIZATION'] = "Basic #{Base64::encode64("#{user_token.user.id}:#{user_token.access_token}")}"
end

# Used by API tests to retrieve XML instead of the standard JSON
def accept_xml
  request.env['HTTP_ACCEPT'] = 'application/xml'
end

def accept_json
  request.env['HTTP_ACCEPT'] = 'application/json'
end

# convenience to have status codes
RSpec.configure do |config|
  config.include HttpStatusCodes
end