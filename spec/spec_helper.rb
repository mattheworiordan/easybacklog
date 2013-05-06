require 'shared_helper'
require 'authentication_helper'
require 'support/feature_helper'

ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)

include Warden::Test::Helpers

require 'rspec/rails'
require 'capybara/rails'
require 'capybara/rspec'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  # == Mock Framework
  #
  # If you prefer to use mocha, flexmock or RR, uncomment the appropriate line:
  #
  # config.mock_with :mocha
  # config.mock_with :flexmock
  # config.mock_with :rr
  config.mock_with :rspec

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = true

  # https://github.com/plataformatec/devise/wiki/How-To%3a-Controllers-and-Views-tests-with-Rails-3-%28and-rspec%29
  config.include Devise::TestHelpers, :type => :controller

  config.include FactoryGirl::Syntax::Methods # allow user of create as opposed to FactoryGirl.create

  config.include Capybara::DSL

  config.include FeatureHelper, type: :request

  config.before(:each, type: :request) do
    create(:locale, :name => 'American English', :code => 'en-US', :position => 5)
    create(:locale, :name => 'British English', :code => 'en-GB', :position => 10)
    create(:locale, :name => 'France French ', :code => 'fr-FR', :position => 10)
    create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE)
    create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED)
    create(:sprint_story_status, :status => 'In progress', :code => SprintStoryStatus::IN_PROGRESS)
    create(:sprint_story_status, :status => 'Completd', :code => SprintStoryStatus::COMPLETED)
    create(:scoring_rule_fib)
    create(:scoring_rule_modified_fib)
    create(:scoring_rule_any)
  end

  config.before(:suite) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each, type: :request) do
    DatabaseCleaner.start
  end

  config.after(:each, type: :request) do
    DatabaseCleaner.clean
  end
end