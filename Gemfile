source 'http://rubygems.org'

# Load Ruby Version into Gemfile for use with Heroku, but strip patch version as not allowed with Heroku
ruby File.read(File.expand_path("../.ruby-version", __FILE__)).strip.gsub(/\-p\d+$/, '')

gem 'rails', '~> 3.2.18'
gem 'pg'
gem 'jquery-rails', '~> 2.1.3'

gem 'haml'
# support for JST templates in sprockets
gem 'ejs'

# authentication
gem 'devise', '~> 2.1.2'
gem 'devise-encryptable', '~> 0.1.1'
gem 'devise-async', '~> 0.4.0'

# orderable items
gem 'acts_as_list', '~> 0.2.0', require: false

# pdf generation
gem 'prawn', '~> 0.12'

# monitoring and reporting of errors
gem 'exceptional'
gem 'newrelic_rpm'

gem 'rack'
gem 'rack-force_domain', :git => 'https://github.com/cwninja/rack-force_domain.git'

gem 'shortly' # shorten URLs using an external service such as bit.ly

gem 'will_paginate'

# load XML as an object
gem 'xml-object'

gem 'deep_merge', :require => 'deep_merge/rails_compat'

# improved hosting on Heroku
gem 'unicorn'
gem 'foreman'

# queuing
gem 'sidekiq', '~> 2.3', require: false
gem 'slim', '~> 1.3.0'
gem 'sinatra', '~> 1.3.0', require: false

# better web server in development
gem 'thin', group: :development

# See http://projects.theforeman.org/issues/2650 & http://stackoverflow.com/questions/13828889/rails-3-heroku-cannot-load-such-file-test-unit-testcase-loaderror
gem 'test-unit', require: false

# Ably is used for presence and realtime updates
gem 'ably'

group :assets do
  gem 'sass-rails'
  gem 'compass'
  gem 'compass-rails'
  gem 'compass-960-plugin'
  gem 'uglifier', require: true
  # speed up generation of assets by only regenerating changed files
  gem 'turbo-sprockets-rails3'
end

group :development, :test do
  gem 'simplecov'
  gem 'awesome_print'
  gem 'pry'
  gem 'pry-rails'
  gem 'pry-byebug'
  gem 'better_errors'
  gem 'binding_of_caller' # REPL for better errors
end

group :production, :staging do
  gem 'rails_12factor'
  gem 'lograge'
end

group :test do
  gem 'minitest'
  gem 'rspec','~>2.7.0'
  gem 'rspec-rails','~>2.7.0'
  gem 'shoulda-matchers'
  gem 'factory_girl_rails'
  gem 'webrat'
  gem 'cucumber-rails', :require => false
  gem 'database_cleaner'
  gem 'capybara', '~> 2.0'
  gem 'poltergeist'
  gem 'timecop'
  gem 'launchy', '>=2'
  gem 'pdf-reader'
  gem 'email_spec'
  gem 'eventmachine', '~> 1.0.4'
  gem 'capybara-screenshot'
  gem 'recursive-open-struct', :git => 'git://github.com/mattheworiordan/recursive-open-struct.git'
end

group :development do
  gem 'ruby_parser' # for Devise generators
  gem 'hpricot' # for Devise generators
  gem 'jslint_on_rails'
  gem 'quiet_assets' # reduce verbosity of console messages for serving up assets
  gem 'dotenv-rails' # load env vars from .env file
end
