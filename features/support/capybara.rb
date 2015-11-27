Capybara.save_and_open_page_path = 'tmp/capybara'

require 'capybara/poltergeist'
Capybara.javascript_driver = :poltergeist

Capybara.default_max_wait_time = 5

Capybara.ignore_hidden_elements = true
