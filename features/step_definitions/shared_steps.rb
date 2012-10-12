Given /^the database has the necessary lookup tables$/ do
  FactoryGirl.create(:locale, :name => 'American English', :code => 'en-US', :position => 5)
  FactoryGirl.create(:locale, :name => 'British English', :code => 'en-GB', :position => 10)
  FactoryGirl.create(:sprint_story_status, :status => 'To do', :code => SprintStoryStatus::DEFAULT_CODE)
  FactoryGirl.create(:sprint_story_status, :status => 'Accepted', :code => SprintStoryStatus::ACCEPTED)
  FactoryGirl.create(:sprint_story_status, :status => 'In progress', :code => SprintStoryStatus::IN_PROGRESS)
  FactoryGirl.create(:sprint_story_status, :status => 'Completd', :code => SprintStoryStatus::COMPLETED)
  FactoryGirl.create(:scoring_rule_fib)
  FactoryGirl.create(:scoring_rule_modified_fib)
  FactoryGirl.create(:scoring_rule_any)
end

Then /^(?:|I )should see the page title "([^\"]+)"$/ do |title|
  sleep 0.2 unless page.has_css?("head title") # https://github.com/thoughtbot/capybara-webkit/issues/36
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
  selector = "#alert-space .#{notice_alert}"
  unless negation.strip == "not" && page.has_no_selector?(selector) # if notice not shown at all allow this to pass if in the negative
    within(selector) do |content|
      if negation.strip == "not"
        page.should_not have_content(message)
      else
        page.should have_content(message)
      end
    end
  end
end

Then /^"([^"]*)"(?: within "([^"]+)")? should be selected for (?:the )?"([^"]+)"$/ do |value, selector, field|
  supports_javascript = page.evaluate_script('true') rescue false
  if (supports_javascript)
    scope = selector_to(selector)
    field = selector_to(field)
    page.evaluate_script("$('#{scope} #{field} option:contains(#{value}):selected').length").should > 0
  else
    # found this method to be less reliable than JQuery :selected as unless selected is explicitly defined
    #  for the option, this XPath returns not selected
    with_scope(selector_to(selector)) do
      field = find_field(selector_to(field))
      field.find(:xpath, ".//option[@selected][text() = '#{value}']").should be_present
    end
  end
end

Then /^"([^"]*)" should be an option for (?:the )?"([^"]+)"$/ do |value, field|
  field = selector_to(field)
  page.evaluate_script("$('#{field} option:contains(#{value})').length").should > 0
end

# not the same as press, as press relies on there being a button
When /^(?:|I )(click|hover over) (?:|the element |on |on the |the )"([^"]+)"(?: within (?:|the )"([^"]+)")?$/ do |action, selector, scope|
  action = (action == 'click' ? '.mousedown().click()' : '.mouseover()')
  selector = selector_to(selector)
  scope = scope.blank? ? '' : "#{selector_to(scope)} "
  page.execute_script "$(':focus').blur()"
  sleep 0.25
  page.evaluate_script("$('#{scope}#{selector.gsub(/'/,'"')}').length").should > 0
  page.execute_script "$('#{scope}#{selector.gsub(/'/,'"')}')#{action}"
end

When /^(?:|I )I blur the focus|the focus is blurred$/ do
  page.execute_script "$(':focus').blur()"
end

When /^(?:|I )fill in "([^"]+)" using Javascript with "([^"]+)"$/ do |selector, value|
  page.evaluate_script("$('#{selector_to(selector)}').length").should > 0
  page.execute_script "$('#{selector_to(selector)}').val('#{value}').keyup().blur();"
  sleep 0.25
end

When /^(?:|I )(|un)check the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) checkbox$/ do |negation, position|
  position = string_quantity_to_numeric(position) - 1
  page.evaluate_script("$($('input[type=checkbox]')[#{position}]).length").should > 0
  checked = page.evaluate_script("$($('input[type=checkbox]')[#{position}]).attr('checked')")
  if checked != (negation == 'un') # don't do anything if already checked
    page.execute_script "$($('input[type=checkbox]')[#{position}]).click()"
  end
end

Then /^the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) (checkbox|toggle box) should be (|un)checked$/ do |position, element_type, negation|
  position = string_quantity_to_numeric(position) - 1
  if element_type == 'checkbox'
    page.evaluate_script("$($('input[type=checkbox]')[#{position}]).attr('checked') + ''").should == (negation == 'un' ? 'undefined' : 'checked')
  else
    page.evaluate_script("$($('.toggle-switch')[#{position}]).is('.checked')").should == (negation == 'un' ? false : true)
  end
end

Then /^(?:|I )there should be (\d+) (?:|elements matching )"([^"]+)"(?:| elements)$/ do |quantity, selector|
  selector = selector_to(selector)
  page.evaluate_script("$('#{selector.gsub(/'/,'"')}').length").to_i.should == quantity.to_i
end

Then /^within (?:|the )"([^"]*)" there should (|not )be a clickable element with the text "([^"]*)"$/ do |selector, negation, text|
  selector = selector_to(selector)
  jquery_selector = %{$('#{selector}').find('input[value="#{text}"],button:contains("#{text}"),a:contains("#{text}")').length}
  if negation == 'not '
    page.evaluate_script(jquery_selector).should == 0
  else
    page.evaluate_script(jquery_selector).should > 0
  end
end

Then /^(?:a |the )(?:|element )"([^"]+)" should (|not )be visible$/ do |selector, negation|
  selector = selector_to(selector)
  page.evaluate_script("$('#{selector}').is(':visible')").should (negation.strip == "not" ? be_false : be_true)
end

Then /^(?:the |)"([^"]+)" should (|not )be disabled$/ do |field_selector, negation|
  selector = selector_to(field_selector)
  if negation == 'not '
    all_enabled = page.evaluate_script <<-JS
      (function() {
        var allEnabled = true;
        $('#{field_selector}').each(function(index, elem) { if ($(elem).attr('disabled')) { allEnabled = false; } });
        return allEnabled;
      })();
    JS
    all_enabled.should == true
  else
    all_disabled = page.evaluate_script <<-JS
      (function() {
        var allDisabled = true;
        $('#{field_selector}').each(function(index, elem) { if (!$(elem).attr('disabled')) { allDisabled = false; } });
        return allDisabled;
      })();
    JS
    all_disabled.should == true
  end
end

Then /^I should see the following data in column (\d+) of "([^"]+)" table:$/ do |data_column, table_path, expected_table|
  table_path = selector_to(table_path)
  actual_table = find(table_path).all('tr').map { |row| row.all("th:nth-child(#{data_column}),td:nth-child(#{data_column})").map { |cell| cell.text.strip } }
  # remove column heading
  actual_table.shift if find(table_path).has_css?('th')
  actual_table = table(actual_table)
  expected_table.diff!(actual_table)
end

When /^(?:|I )wait (?:|for (?:|AJAX for ))(\d+(?:|\.\d+)) seconds?$/ do |time|
  sleep time.to_f
end

Then /^(?:|I )start (?:the debugger|debugging)$/ do
  debugger
  page
end