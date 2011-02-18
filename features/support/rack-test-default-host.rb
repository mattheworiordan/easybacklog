# Necessary evil thing: Rack::Test sports as default host
# "example.org", but Webrat and Ruby on Rails's integration test
# classes use "example.com"; this discrepancy leads to Webrat not
# being able to follow simple internal redirects.
#
# Drop in in features/support/

module Rack
  module Test
    DEFAULT_HOST = "example.com"
  end
end