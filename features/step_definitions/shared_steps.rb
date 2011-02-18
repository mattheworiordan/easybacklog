Then /^(?:|I )should see the page title "([^\"]*)"$/ do |title|
  within("head title") do |content|
    content.should contain(title)
  end
end

Then /^(?:|I )should (|not )see the following error messages:$/ do |negation, error_messages|
  within(".form_errors") do |content|
    error_messages.raw.flatten.each do |error_message|
      if negation.strip == "not"
        content.should_not contain(error_message)
      else
        content.should contain(error_message)
      end
    end
  end
end

Then /^(?:|I )should (|not )see the (notice|alert) "([^"]+)"$/ do |negation, notice_alert, message|
  within("#alert-space .#{notice_alert}") do |content|
    if negation.strip == "not"
      content.should_not contain(message)
    else
      content.should contain(message)
    end
  end
end

# Webrat relies on the onclick attribute to "fake" HTTP request's
# method, so it cannot cope with the new Ruby on Rails 3's style
# which uses unobtrusive JavaScript and HTML5 data attributes.

When /^(?:|I )follow Delete$/ do
  click_link "Delete", :method => :delete
end

Given /^the standard locales are set up$/ do
  Factory.create(:locale, :name => 'American English', :code => 'en-US', :position => 5)
  Factory.create(:locale, :name => 'British English', :code => 'en-GB', :position => 10)
end