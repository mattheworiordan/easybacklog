Capybara.save_and_open_page_path = 'tmp/capybara'

require 'capybara/poltergeist'
Capybara.javascript_driver = :poltergeist

# Capybara.default_wait_time = 2 # double the wait time as we've experienced intermitten problems
Capybara.ignore_hidden_elements = true
