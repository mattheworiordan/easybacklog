source 'http://rubygems.org'

gem 'rails', '~> 3.2'
gem 'pg'
gem 'jquery-rails'

gem 'haml'
# support for JST templates in sprockets
gem 'ejs'

# authentication
gem 'devise'
gem 'acts_as_list' # orderable items

# pdf generation
gem 'prawn', '~> 0.12'

gem 'airbrake'

gem 'rack-force_domain', :git => 'https://github.com/cwninja/rack-force_domain.git'

gem 'shortly' # shorten URLs using an external service such as bit.ly

gem 'will_paginate'

# load XML as an object
gem 'xml-object'

gem 'vanity', :git => 'https://github.com/assaf/vanity'

group :assets do
  gem 'sass-rails'
  gem 'compass'
  gem 'compass-rails'
  gem 'compass-960-plugin'
  gem 'uglifier'
end

group :development, :test, :cucumber do
  gem 'ruby-debug-base19', '~> 0.11.26'
  gem 'ruby-debug19', :require => 'ruby-debug'
  gem 'awesome_print'
  gem 'watchr'
  gem 'growl'
  gem 'pry'
  gem 'pry-rails', :git => 'git://github.com/chrisfarber/pry-rails.git'
  # gem 'pry-doc' # apparently causing segmentation faults http://stackoverflow.com/questions/8065611/ruby-1-9-3-p0-and-rspec-causes-frequent-segmentation-faults/8619319#8619319
end

group :test, :cucumber do
  gem 'rspec','>=2.7.0'
  gem 'rspec-rails','>=2.7.0'
  gem 'shoulda-matchers'
  gem 'factory_girl_rails'
  gem 'webrat'
  gem 'cucumber-rails'
  gem 'autotest'
  gem 'autotest-growl'
  gem 'autotest-rails'
  gem 'database_cleaner'
  gem 'capybara', '~> 1.0'
  gem 'capybara-webkit', :git => 'git://github.com/thoughtbot/capybara-webkit.git'
  gem 'timecop'
  gem 'launchy', '>=2'
  gem 'pdf-reader'
  gem 'email_spec'
  gem 'capybara-screenshot'
end

group :development do
  # multiple environments for Heroku
  gem 'taps', '>=0.3.23'
  gem 'heroku'
  gem 'heroku_san'
  gem 'ruby_parser' # for Devise generators
  gem 'hpricot' # for Devise generators
  gem 'jslint_on_rails'
end
