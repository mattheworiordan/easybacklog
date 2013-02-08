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
