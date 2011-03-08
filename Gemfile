source 'http://rubygems.org'

gem 'rails', '3.0.3'

gem 'sqlite3-ruby', :require => 'sqlite3'

gem 'haml'

gem 'devise'

gem 'acts_as_list' # orderable items

gem 'jammit'

group :development, :test, :cucumber do
  # gem 'ruby-debug'
  gem 'awesome_print', :git => 'http://github.com/michaeldv/awesome_print.git', :require => 'ap'
end

group :test, :cucumber do
  gem 'rspec','>=2.0.0'
  gem 'rspec-rails','>=2.0.0'
  gem 'shoulda-matchers'
  gem 'factory_girl_rails'
  gem 'webrat'
  gem 'cucumber-rails'
  gem 'autotest'
  gem 'autotest-growl'
  gem 'autotest-rails'
  gem 'database_cleaner'
  gem 'capybara'
  gem 'culerity'
  gem 'Selenium'
  gem 'selenium-client'
end

group :development do
  gem 'ruby-debug19', :require => 'ruby-debug'
  # multiple environments for Heroku
  gem 'heroku'
  gem 'heroku_san'
  gem 'ruby_parser' # for Devise generators
  gem 'hpricot' # for Devise generators
end