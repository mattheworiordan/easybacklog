ActionController::Base.allow_rescue = false

# e-mail spec
# Make sure this require is after you require cucumber/rails/world.
require 'email_spec' # add this line if you use spork
require 'email_spec/cucumber'

# screenshot
require 'capybara-screenshot/cucumber'

# if not logged in, experienced issue with Firefox being launched as 0x0 width & height
Before('@javascript,@selenium') do
  if Capybara.current_driver == :selenium
    Capybara.current_session.driver.browser.manage.window.resize_to 1000,720
  elsif Capybara.current_driver == :webkit
    Capybara.current_session.driver.resize_window 1000,720
  end
end

# allow the use of transactions even with Cucumber
class ActiveRecord::Base
  mattr_accessor :shared_connection
  @@shared_connection = nil

  def self.connection
    @@shared_connection || retrieve_connection
  end
end

# Forces all threads to share the same connection. This works on
# Capybara because it starts the web server in a thread.
ActiveRecord::Base.shared_connection = ActiveRecord::Base.connection
