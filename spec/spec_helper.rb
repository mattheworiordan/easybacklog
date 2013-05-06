require 'capybara/rails'
require 'capybara/rspec'
require 'shared_helper'
require 'authentication_helper'
# require 'spork'

include Warden::Test::Helpers

# Spork.prefork do
  # Loading more in this block will cause your tests to run faster. However,
  # if you change any configuration or code from libraries loaded here, you'll
  # need to restart spork for it take effect.

  # This file is copied to spec/ when you run 'rails generate rspec:install'
  ENV["RAILS_ENV"] ||= 'test'
  require File.expand_path("../../config/environment", __FILE__)
  require 'rspec/rails'

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
  end
# end

# Spork.each_run do
#   # This code will be run each time you run your specs.
# end