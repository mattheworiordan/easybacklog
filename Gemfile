source 'http://rubygems.org'

gem 'rails', '3.0.10'
gem 'pg'

gem 'haml'

gem 'devise'
gem 'acts_as_list' # orderable items
gem 'jammit'

# pdf generation
gem 'prawn', '~> 0.12'

gem 'hoptoad_notifier','>=2.4.8'

gem 'rack-force_domain', :git => 'https://github.com/cwninja/rack-force_domain.git'

gem 'compass'
gem 'compass-960-plugin'

gem 'shortly' # shorten URLs using an external service such as bit.ly

gem 'will_paginate'

group :development, :test, :cucumber do
  gem 'ruby-debug-base19', '~> 0.11.26'
  gem 'ruby-debug19', :require => 'ruby-debug'
  gem 'awesome_print', :git => 'http://github.com/michaeldv/awesome_print.git', :require => 'ap'
  gem 'watchr'
  gem 'growl'
  gem 'pry'
  gem 'pry-rails'
  gem 'pry-doc'
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
