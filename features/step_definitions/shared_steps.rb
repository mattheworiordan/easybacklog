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
  with_scope(selector) do
    field = find_field(field)
    field.find(:xpath, ".//option[@selected = 'selected'][text() = '#{value}']").should be_present
  end
end

Given /^the standard locales are set up$/ do
  Factory.create(:locale, :name => 'American English', :code => 'en-US', :position => 5)
  Factory.create(:locale, :name => 'British English', :code => 'en-GB', :position => 10)
end

Then /take a snapshot(| and show me the page)/ do |show_me|
  page.driver.render Rails.root.join("tmp/capybara/#{Time.now.strftime('%Y-%m-%d-%H-%M-%S')}.png") if page.driver.respond_to?(:render)
  Then %{show me the page} if !show_me.blank?
end

When /^(?:|I )click the element "([^"]+)"$/ do |selector|
  page.execute_script "$('#{selector.gsub(/'/,'"')}').click()"
end

Then /^(?:|I )there should be (\d+) elements matching "([^"]+)"$/ do |quantity, selector|
  page.evaluate_script("$('#{selector.gsub(/'/,'"')}').length").to_i.should == quantity.to_i
end

When /^(?:|I )wait (?:|for (?:|AJAX for ))(\d+(?:|\.\d+)) seconds?$/ do |time|
  sleep time.to_f
end

Then /^I should (|not )see the text "([^"]+)" within "([^"]+)"$/ do |negation, text, selector|
  within(selector) do |content|
    if negation.strip == "not"
      page.should_not have_content(text)
    else
      page.should have_content(text)
    end
  end
end

Then /^within "([^"]*)" there should be a clickable element with the text "([^"]*)"$/ do |selector, text|
  page.evaluate_script(%{$('#{selector}').find('input[value="#{text}"],button:contains("#{text}"),a:contains("#{text}")').length}).should > 0
end