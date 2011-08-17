Then /^(?:|I )should see the page title "([^\"]*)"$/ do |title|
  with_scope("head title") do |content|
    page.should have_content(title)
  end
end

Then /^(?:|I )should (|not )see the following error messages:$/ do |negation, error_messages|
  error_messages.raw.flatten.each do |error_message|
    failed = false
    passed = false
    all(:css, ".form_errors").each do |content|
      if negation.strip == "not"
        failed = true if content.has_content?(error_message)
      else
        passed = true if content.has_content?(error_message)
      end
    end
    if negation.strip == "not" && failed
      raise "Error message \"#{error_message}\" was found in error messages."
    elsif negation.strip != "not" && !passed
      raise "Error message \"#{error_message}\" was not found in error messages."
    end
  end
end

Then /^(?:|I )should (|not )see the (notice|alert|error) "([^"]+)"$/ do |negation, notice_alert, message|
  notice_alert = 'error' if notice_alert == 'alert' # errors and alerts are stored in the same .error class
  within("#alert-space .#{notice_alert}") do |content|
    if negation.strip == "not"
      page.should_not have_content(message)
    else
      page.should have_content(message)
    end
  end
end

# Webrat relies on the onclick attribute to "fake" HTTP request's
# method, so it cannot cope with the new Ruby on Rails 3's style
# which uses unobtrusive JavaScript and HTML5 data attributes.

When /^(?:|I )follow Delete$/ do
  click_link "Delete", :method => :delete
end

When /^(?:|I )change the editable text "([^"]+)" within tag "([^"]+)" to "([^"]+)"$/ do |text, tag, new_text|
  page.execute_script %{$('#{tag}:contains("#{text}")').click();}
  page.execute_script %{$('form input[name=value]').attr('value','#{new_text}');}
  page.execute_script %{$('form input[name=value]').blur();}
  sleep(1)
end

Given /^the standard locales are set up$/ do
  Factory.create(:locale, :name => 'American English', :code => 'en-US', :position => 5)
  Factory.create(:locale, :name => 'British English', :code => 'en-GB', :position => 10)
end