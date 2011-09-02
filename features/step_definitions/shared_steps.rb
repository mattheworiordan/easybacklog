Given /^the standard locales are set up$/ do
  Factory.create(:locale, :name => 'American English', :code => 'en-US', :position => 5)
  Factory.create(:locale, :name => 'British English', :code => 'en-GB', :position => 10)
end

Then /^(?:|I )should see the page title "([^\"]+)"$/ do |title|
  with_scope("head title") do
    page.text.should match(title)
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

Then /^(?:|I )should (|not )see the (notice|alert|error|warning) "([^"]+)"$/ do |negation, notice_alert, message|
  notice_alert = 'error' if notice_alert == 'alert' # errors and alerts are stored in the same .error class
  within("#alert-space .#{notice_alert}") do |content|
    if negation.strip == "not"
      page.should_not have_content(message)
    else
      page.should have_content(message)
    end
  end
end

Then /^"([^"]*)"(?: within "([^"]+)")? should be selected for "([^"]+)"$/ do |field, selector, value|
  with_scope(selector_to(selector)) do
    field = find_field(field)
    field.find(:xpath, ".//option[@selected = 'selected'][text() = '#{value}']").should be_present
  end
end

# not the same as press, as press relies on there being a button
When /^(?:|I )click (?:|the element |on )"([^"]+)"$/ do |selector|
  selector = selector_to(selector)
  page.execute_script "$('#{selector.gsub(/'/,'"')}').click()"
end

Then /^(?:|I )there should be (\d+) (?:|elements matching )"([^"]+)"(?:| elements)$/ do |quantity, selector|
  selector = selector_to(selector)
  page.evaluate_script("$('#{selector.gsub(/'/,'"')}').length").to_i.should == quantity.to_i
end

Then /^within (?:|the )"([^"]*)" there should be a clickable element with the text "([^"]*)"$/ do |selector, text|
  selector = selector_to(selector)
  page.evaluate_script(%{$('#{selector}').find('input[value="#{text}"],button:contains("#{text}"),a:contains("#{text}")').length}).should > 0
end

When /^(?:|I )wait (?:|for (?:|AJAX for ))(\d+(?:|\.\d+)) seconds?$/ do |time|
  sleep time.to_f
end