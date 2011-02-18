# Cucumber 0.9.4 + Webrat 0.7.2: the generated env.rb still uses the
# :rails mode, but it's the wrong mode to use with Ruby on Rails 3.
# Here we reconfigure Webrat and include some missing modules in
# Cucumber's World.
#
# Drop it in features/support/

Webrat.configure do |config|
  config.mode = :rack
  config.open_error_files = false
end

World Rack::Test::Methods
World Webrat::Methods
World Webrat::Matchers