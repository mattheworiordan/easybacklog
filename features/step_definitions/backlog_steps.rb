##
# Backlog and Theme Creation
#

Given /^a standard backlog named "([^\"]+)" is set up for "([^\"]+)"$/ do |backlog_name, company_name|
  company = Company.find_by_name(company_name)
  raise "Company #{company_name} does not exist." if company.blank?

  backlog = Factory.create(:backlog, :company => company, :name => backlog_name)
  (1..2).each do |index|
    theme = Factory.create(:theme, :backlog => backlog)
    (1..3).each { |ac| Factory.create(:acceptance_criterion, :story => Factory.create(:story, :theme => theme) ) }
  end
end

Given /^(?:|I )create a theme named "([^"]+)"$/ do |name|
  When %{I click the element ".new-theme:contains('Add theme')"}
  # pause for new theme to be created and cursor to move into the correct place
  When %{I wait for 0.25 seconds}
  When %{I change the current editable text to "#{name}"}
  When %{I tab forwards and wait for AJAX to update}
end

Given /^the following themes are created:$/ do |table|
  table.raw.each do |row|
    theme_name = row[0]
    Given %{I create a theme named "#{theme_name}"}
  end
end

##
# Editable text
#

When /^(?:|I )change the current editable text to "([^"]+)"$/ do |text|
  page.evaluate_script("$('form input[name=value]:focus').length").should > 0
  page.execute_script %{$('form input[name=value]:focus').attr('value','#{text}')}
end

When /^(?:|I )change the editable text "([^"]+)" within tag "([^"]+)" to "([^"]+)"$/ do |text, tag, new_text|
  # blur any currently editable input field
  page.execute_script %{$('form input[name=value]').blur()}
  # we should be editing a field, let's double check it exists
  page.evaluate_script(%{$('#{tag}:contains("#{text}")').length}).should > 0
  # click on the div to bring up the input field
  page.execute_script %{$('#{tag}:contains("#{text}")>div.data').click();}
  sleep 0.25
  When %{I change the current editable text to "#{new_text}"}
end

##
# Tabbing and Key Presses
#

When /^(?:|I )tab (forwards|backwards)(?:| (\d+) times?)$/ do |forward_or_back, quantity|
  quantity ||= 1
  quantity.to_i.times do
    shiftKey = forward_or_back == "forwards" ? 'false' : 'true'
    page.execute_script "$(':focus').simulate('keydown', { keyCode: $.simulate.VK_TAB, shiftKey: #{shiftKey} })"
    sleep 0.1
  end
end

When /^(?:|I )tab (forwards|backwards) and wait for AJAX(?:| to update)$/ do |forward_or_back|
  When %{I tab #{forward_or_back}}
  sleep 0.75
end

When /^(?:|I )press enter$/ do
  page.execute_script page.execute_script "$(':focus').simulate('keydown', { keyCode: $.simulate.VK_ENTER })"
end

When /^(?:|I )press enter and wait for AJAX(?:| to update)$/ do
  When %{I press enter}
  sleep 0.75
end


##
# Focus manipulation
#

Then /^the field focussed on should be an? "([^"]+)"$/ do |selector|
  page.evaluate_script("$(':focus').is('#{selector}')").should == true
end

Then /^the field focussed on should descend from "([^"]+)"$/ do |selector|
  page.evaluate_script("$(':focus').parents('#{selector}').length").should > 0
end

Then /^the focussed element should have the text "([^"]*)"$/ do |text|
  page.evaluate_script(%{$(':focus').is(':contains("#{text}")')}).should be_true
end

Then /^the focussed element should have a parent "([^"]*)"$/ do |selector|
  page.evaluate_script(%{ $(':focus').parents('#{selector}').length }).should > 0
end

Then /^the focussed element should be an editable text field$/ do
  page.evaluate_script(%{$(':focus').is('input[name=value]')}).should be_true
end

##
# Drag and drop
#

When /^I drag theme "([^"]+)" (down|up) by (\d+) positions?$/ do |theme_name, direction, positions|
  move_by = direction == 'up' ? -positions.to_i : positions.to_i
  page.execute_script(%{
    $('ul.themes li.theme:has(.theme-data .name .data:contains("#{theme_name}"))').
      simulateDragSortable({move:#{move_by}, handle:'.move-theme', listItem:'li.theme', placeHolder:'.target-order-highlight'});
  })
  sleep 0.1
end

Then /^theme "([^"]+)" should be in position (\d+)$/ do |theme_name, position|
  page.evaluate_script(%{$('ul.themes li.theme:has(.theme-data .name .data:contains("#{theme_name}"))').attr('id') ===
    $('ul.themes li.theme:nth-child(#{position})').attr('id')}).should be_true
end

##
# Visibility
#
Then /^the element "([^"]+)" should (|not )be visible$/ do |selector, negation|
  page.evaluate_script("$('#{selector}').is(':visible')").should (negation.strip == "not" ? be_false : be_true)
end

##
# Server communication and verification
#

# update the model data from the server in the browser
Then /^reload the backlog JSON from the server$/ do
  page.execute_script "App.Collections.Backlogs.at(0).fetch();"
  sleep 1
end

Then /^the server should return theme JSON as follows:$/ do |table|
  Then %{reload the backlog JSON from the server}
  columns = table.column_names.map { |d| "'#{d}'"}.join(',')
  data = page.evaluate_script <<-JS
    (function() {
      var themes = App.Collections.Backlogs.at(0).Themes().sortBy(function(e) { return e.get('position') });
      var columns = [#{columns}];
      var data = [columns];
      _(themes).each(function(theme) {
        data.push(_(columns).map(function(key) { return theme.get(key) }));
      });
      return data;
    })();
  JS
  table.diff!(data)
end