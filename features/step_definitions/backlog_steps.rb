##
# Backlog and Theme Creation
#

Given /^a standard backlog named "([^\"]+)" is set up for "([^\"]+)"$/ do |backlog_name, account_name|
  account = Account.find_by_name(account_name)
  raise "Account #{account_name} does not exist." if account.blank?

  backlog = Factory.create(:backlog, :account => account, :name => backlog_name)
  (1..2).each do |index|
    theme = Factory.create(:theme, :backlog => backlog, :name => "Theme #{index}")
    (1..3).each { |ac| Factory.create(:acceptance_criterion, :story => Factory.create(:story, :theme => theme) ) }
  end
end

Given /^a backlog named "([^\"]+)" with (\d+) themes? (?:and (\d+) stor(?:y|ies) in each theme )?is set up for "([^\"]+)"$/ do |backlog_name, theme_quantity, story_quantity, account_name|
  account = Account.find_by_name(account_name)
  raise "Account #{account_name} does not exist." if account.blank?

  backlog = Factory.create(:backlog, :account => account, :name => backlog_name)
  theme_quantity.to_i.times do |index|
    theme = Factory.create(:theme, :backlog => backlog, :name => "Theme #{index+1}")
    unless story_quantity.blank?
      story_quantity.to_i.times do |story_index|
        Factory.create(:story, :theme => theme, :as_a => "Story #{story_index+1}", :score_50 => nil, :score_90 => nil)
      end
    end
  end
end

Given /^(?:|I )create a theme named "([^"]+)"$/ do |name|
  step %{I click the element ".new-theme:contains('Add theme')"}
  # pause for new theme to be created and cursor to move into the correct place
  step %{I wait for 0.25 seconds}
  step %{I change the current editable text to "#{name}"}
  step %{I tab forwards and wait for AJAX to update}
end

Given /^the following themes are created:$/ do |table|
  table.raw.each do |row|
    theme_name = row[0]
    step %{I create a theme named "#{theme_name}"}
  end
end

Given /^(?:|I )create a story with as set to "([^"]+)" in the ([\w\d]+) theme$/ do |as_value, position|
  step %{the focus is on the "#{position} theme's add story button"}
  step %{I press enter and wait for AJAX}
  step %{I change the current editable text to "#{as_value}"}
  step %{I tab forwards and wait for AJAX}
end

Given /^the following stories are created in the ([\w\d]+) theme:$/ do |position, table|
  table.raw.each do |row|
    as_value = row[0]
    step %{I create a story with as set to "#{as_value}" in the #{position} theme}
  end
end

Given /^a snapshot called "([^"]+)" exists for backlog "([^"]+)"$/ do |snapshot_name, backlog_name|
  backlog = Backlog.find_by_name(backlog_name)
  backlog.create_snapshot(snapshot_name)
end

Given /^a backlog named "([^"]*)" assigned to company "([^"]*)" for account "([^"]*)" is set up$/ do |backlog_name, company_name, account_name|
  account = Account.find_by_name(account_name)
  raise "Account #{account_name} does not exist." if account.blank?

  company = account.create_company(company_name)

  backlog = Factory.create(:backlog, :account => account, :name => backlog_name, :company => company)
end

Given /^(an example backlog for testing|the example backlog) is set up for (?:the |)account "([^"]*)"$/ do |which_example, account_name|
  account = Account.find_by_name(account_name)
  raise "Account #{account_name} does not exist." if account.blank?
  user = account.users.first
  file = which_example =~ /an example backlog for testing/ ? 'cucumber_example_backlog_with_sprints' : 'new_account_backlog'
  example_data = XMLObject.new(Rails.root.join("db/samples/#{file}.xml"))
  backlog_builder = Creators::BacklogCreator.new
  backlog_builder.create example_data, account, user
end

##
# Editable text
#

When /^(?:|I )change the current editable text to "([^"]*)"$/ do |text|
  page.evaluate_script("$('form input[name=value]:focus, form textarea[name=value]:focus').length").should > 0
  page.execute_script %{$('form input[name=value]:focus, form textarea[name=value]:focus').attr('value','#{text}')}
  # trigger key down as elements such as auto-complete need this event fired
  page.execute_script %{$('form input[name=value]:focus, form textarea[name=value]:focus').simulate('keydown')}
end

When /^(?:|I )change the editable text "([^"]+)" within (?:|tag |the )"([^"]+)" to "([^"]*)"$/ do |text, tag, new_text|
  tag = selector_to(tag)
  # we should be editing a field, let's double check it exists
  page.evaluate_script(%{$('#{tag}:contains(#{text})').length}).should > 0
  # click on the div to bring up the input field
  step %{I click the element "#{tag}:contains(#{text})"}
  sleep 0.25
  step %{I change the current editable text to "#{new_text}"}
end

Then /^the editable text value should be "([^"]*)"$/ do |text|
  page.evaluate_script(%{ $('form input[name=value]:focus, form textarea[name=value]:focus').val(); }).should == text
end

Then /^I should see the following auto\-complete options:$/ do |expected_table|
  actual_table = table(find('.ui-autocomplete').all('li.ui-menu-item').map { |row| [row.find('a').text] })
  expected_table.diff!(actual_table)
end

##
# Tabbing and Key Presses
#

When /^(?:|I )tab (forwards|backwards)(?:| (\d+) times?)$/ do |forward_or_back, quantity|
  quantity ||= 1
  quantity.to_i.times do
    shiftKey = forward_or_back == "forwards" ? 'false' : 'true'
    page.execute_script "$(':focus').simulate('keydown', { keyCode: $.simulate.VK_TAB, shiftKey: #{shiftKey} })"
    sleep 0.3 # 0.25s for an editable text field to be change back after losing focus
  end
end

When /^(?:|I )tab (forwards|backwards) and wait for AJAX(?:| to update)$/ do |forward_or_back|
  step %{I tab #{forward_or_back}}
  sleep 0.75
end

When /^(?:|I )press enter$/ do
  page.execute_script page.execute_script "$(':focus').simulate('keydown', { keyCode: $.simulate.VK_ENTER })"
end

When /^(?:|I )press escape$/ do
  page.execute_script page.execute_script "$(':focus').simulate('keydown', { keyCode: $.simulate.VK_ESC })"
end

When /^(?:|I )press enter and wait for AJAX(?:| to update)$/ do
  step %{I press enter}
  sleep 0.75
end

When /^(?:|I )press the (down|up|right|left) arrow$/ do |direction|
  direction = "VK_#{direction.upcase}"
  page.execute_script page.execute_script "$(':focus').simulate('keydown', { keyCode: $.simulate.#{direction} })"
end

##
# Focus manipulation
#

Then /^the focussed element should have the text "([^"]*)"$/ do |text|
  # ensure we have not incorrectly focussed on the body meaning it will contain the text anyway
  page.evaluate_script(%{$(':focus').is('body, header')}).should be_false
  page.evaluate_script(%{$(':focus').is(':contains("#{text}")')}).should be_true
end

Then /^the focussed element should (?:have a parent|be an?|be the) "([^"]*)"$/ do |selector|
  selector = selector_to(selector)
  page.evaluate_script(%{ $(':focus').parents('#{selector}').length }).should > 0
end

Then /^the focussed element should be an editable text field$/ do
  page.evaluate_script(%{$(':focus').is('input[name=value],textarea[name=value]')}).should be_true
end

Given /^the focus is on the "([^"]*)"$/ do |selector|
  selector = selector_to(selector)
  page.evaluate_script(%{ $('#{selector}').length }).should > 0
  page.execute_script(%{
    if ($('#{selector}').is('a,button,input,textarea,select')) {
      $(':focus').blur();
      $('#{selector}').focus();
    } else {
      // could be editable text so we need to click for it to get focus
      if (!$('#{selector}').has('input[name=value], textarea[name=value]')) {
        $(':focus').blur();
        $('#{selector}').click();
      } else {
        // editable field already visible, just ensure it has focus
        $('#{selector}').find('input[name=value], textarea[name=value]').focus();
      }
    }
  })
  sleep 0.1 # allow for editable text to appear if appropriate
end

## Story validation
#
Then /^the "([^"]+)" should (not )?allow the values "([^"]+)"$/ do |field, negation, values|
  values.split(',').each do |val|
    step %{I click on the "#{field}"}
    step %{I change the current editable text to "#{val}"}
    step %{I tab forwards and wait for AJAX}
    if negation.present?
      step %{I should see the error "Score"}
      step %{I should not see "#{val}" within the "#{field}"}
    else
      step %{I should see "#{val}" within the "#{field}"}
    end
  end
end

Then /^the "([^"]+)" should (|not )be editable to this user$/ do |field, negation|
  step %{I click on the "#{field}"}
  if negation == 'not '
    step %{I should see the warning "You do not have permission to edit"}
  else
    step %{the focussed element should be an editable text field}
  end
end

##
# Drag and drop
#

When /^I drag theme "([^"]+)" (down|up) by (\d+) positions?$/ do |theme_name, direction, positions|
  move_by = direction == 'up' ? -positions.to_i : positions.to_i
  page.evaluate_script(%{ $('ul.themes li.theme:has(.theme-data .name .data:contains("#{theme_name}"))').length }).should > 0
  page.execute_script %{
    $('ul.themes li.theme:has(.theme-data .name .data:contains("#{theme_name}"))').
      simulateDragSortable({move:#{move_by}, handle:'.move-theme', listItem:'li.theme', placeHolder:'.target-order-highlight'});
  }
  sleep 0.1
end

Then /^(?:|the )theme "([^"]+)" should be in position (\d+)$/ do |theme_name, position|
  page.evaluate_script(%{$('ul.themes li.theme:has(.theme-data .name .data:contains("#{theme_name}"))').attr('id') ===
    $('ul.themes li.theme:nth-child(#{position})').attr('id')}).should be_true
end

When /^I drag story with as equal to "([^"]+)" (down|up) by (\d+) positions?$/ do |story_as, direction, positions|
  move_by = direction == 'up' ? -positions.to_i : positions.to_i
  page.evaluate_script(%{ $('ul.stories li.story:has(".user-story .as-a .data:contains(#{story_as})")').length }).should > 0
  page.execute_script %{
    $('li.story:has(".user-story .as-a .data:contains(#{story_as})")').
      simulateDragSortable({ move: #{move_by}, listItem: '.story', placeHolder: '.target-order-highlight' });
  } # old drag used handle: '.move-story a'
  sleep 0.1
end

When /^I drag story with as equal to "([^"]+)" to the (.+) theme position (\d+)?$/ do |story_as, theme_position, position|
  page.evaluate_script(%{ $('ul.stories li.story:has(".user-story .as-a .data:contains(#{story_as})")').length }).should > 0
  theme_position = selector_to("#{theme_position} theme's stories")
  page.evaluate_script(%{ $('#{theme_position}').length }).should > 0
  page.execute_script %{
    $('li.story:has(".user-story .as-a .data:contains(#{story_as})")').
      simulateDragSortable({ move: #{position.to_i - 1}, listItem: '.story', placeHolder: '.target-order-highlight', dropOn: '#{theme_position}' });
  }
  sleep 0.5
end

Then /^(?:|the )story with as equal to "([^"]+)" should be in position (\d+)$/ do |story_as, position|
  page.evaluate_script(%{$('li.story:has(".user-story .as-a .data:contains(#{story_as})")').attr('id') ===
    $('li.story:eq(#{position.to_i-1})').attr('id')}).should be_true
end

Then /^story with as equal to "([^"]*)" should(| not) be in theme "([^"]*)"$/ do |story_as, negation, theme_name|
  theme_scope = "li.theme:has(.name .data:contains(#{theme_name}))"
  story_selector = "li.story:has(.as-a .data:contains(#{story_as}))"
  matching = page.evaluate_script("$('#{theme_scope} #{story_selector}').length")
  if (negation == ' not')
    matching.should == 0
  else
    matching.should > 0
  end
end

When /^I drag acceptance criterion "([^"]+)" (down|up) by (\d+) positions?$/ do |criterion, direction, positions|
  move_by = direction == 'up' ? -positions.to_i : positions.to_i
  page.evaluate_script(" $('ul.acceptance-criteria li.criterion:has(.data:contains(#{criterion}))').length ").should > 0
  page.execute_script %{
    $('ul.acceptance-criteria li.criterion:has(.data:contains(#{criterion}))').
      simulateDragSortable({ move: #{move_by}, handle: '.index', listItem: '.criterion', placeHolder: '.target-order-highlight' });
  }
  sleep 0.1
end

Then /^(?:|the )acceptance criterion "([^"]+)" should be in position (\d+)$/ do |criterion, position|
  page.evaluate_script(%{$('li.criterion:has(.data:contains(#{criterion}))').attr('id') ===
    $('li.criterion:nth-child(#{position})').attr('id')}).should be_true
end

##
# Colour
#
Then /^the story with as equal to "([^"]*)" should be (red|green)$/ do |as_value, colour|
  color = colour == 'red' ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)'
  page.evaluate_script("$('li.story::has(.user-story .as-a .data:contains(#{as_value})) .background-color-indicator').css('backgroundColor')").should == color
end

##
# Tab system
Then /^the "([^"]*)" tab should be selected$/ do |tab|
  selector = selector_to("#{tab} backlog tab")
  page.evaluate_script("$('#{selector}').length").should >= 1
end

##
# Action menus
When /^I (re-number|delete) the (.*) theme$/ do |action, index|
  step %{I click "action menu icon of the #{index} theme"}
  step %{I click "#{action} of the #{index} theme"}
  # allow enough time for event to propagate and dialog to appear
  sleep 0.1
end

When /^I (move|delete|duplicate|assign to a sprint) the (.*) story(| within the .*)$/ do |action, index, within|
  step %{I click "#{index} story's action menu icon#{within}"}
  step %{I click "#{index} story's #{action}#{within}"}
  # allow enough time for event to propagate and dialog to appear
  sleep 0.1
end

##
# Sprints

When /^the (.* story)(| within the .* theme) should (not be assigned to a sprint|be assigned to sprint (\d+))/ do |story_path, theme_info, negation, sprint_iteration|
  story_selector = selector_to("#{story_path}'s sprint tab#{theme_info}")
  if negation == 'not be assigned to a sprint'
    script = %{$('#{story_selector}').length == 0}
  else
    script = %{$('#{story_selector} a[href="##{sprint_iteration}"]').length > 0}
  end
  page.evaluate_script(script).should be_true
end

##
# Server communication and verification
#

# update the model data from the server in the browser
Then /^reload the backlog JSON from the server$/ do
  page.execute_script "App.Collections.Backlogs.at(0).fetch();"
  sleep 2.5
end

Then /^the server should return theme JSON as follows:$/ do |table|
  step %{reload the backlog JSON from the server}
  step %{wait for 1 second}
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

Then /^the server should return story JSON as follows:$/ do |table|
  step %{reload the backlog JSON from the server}
  step %{wait for 1 second}
  columns = table.column_names.map { |d| "'#{d}'"}.join(',')
  data = page.evaluate_script <<-JS
    (function() {
      var columns = [#{columns}];
      var data = [columns];
      var themes = App.Collections.Backlogs.at(0).Themes().sortBy(function(e) { return e.get('position') });
      _(themes).each(function(theme) {
        var stories = theme.Stories().sortBy(function(e) { return e.get('position') });
        _(stories).each(function(story) {
          data.push(_(columns).map(function(key) { return story.get(key) ? story.get(key) + '' : '' }));
        });
      });
      return data;
    })();
  JS
  table.diff!(data)
end

Then /^the server should return acceptance criteria JSON as follows:$/ do |table|
  step %{reload the backlog JSON from the server}
  step %{wait for 1 second}
  columns = table.column_names.map { |d| "'#{d}'"}.join(',')
  data = page.evaluate_script <<-JS
    (function() {
      var columns = [#{columns}];
      var data = [columns];
      var themes = App.Collections.Backlogs.at(0).Themes().sortBy(function(e) { return e.get('position') });
      _(themes).each(function(theme) {
        var stories = theme.Stories().sortBy(function(e) { return e.get('position') });
        _(stories).each(function(story) {
          var acceptanceCriteria = story.AcceptanceCriteria().sortBy(function(e) { return e.get('position') });
          _(acceptanceCriteria).each(function(criterion) {
            data.push(_(columns).map(function(key) { return criterion.get(key) ? criterion.get(key) + '' : '' }));
          });
        });
      });
      return data;
    })();
  JS
  table.diff!(data)
end

Then /^the actual completed velocity in the stats JSON for backlog "([^"]+)" should be (\d+) for sprint (\d+)$/ do |backlog_name, points, sprint|
  backlog = Backlog.find_by_name(backlog_name)
  data = page.evaluate_script <<-JS
    (function() {
      var json;
      $.ajaxSetup({async:false});
      $.get('/backlogs/#{backlog.id}/backlog-stats', {}, function(data) {
        json = data;
      });
      return json;
    })();
  JS
  data['burn_down']['actual'][sprint.to_i]['completed'].should == points.to_i
  data['burn_up']['actual'][sprint.to_i-1]['completed'].should == points.to_i
  data['velocity_completed'][sprint.to_i-1]['completed'].should == points.to_i
end

##
# Tables within Excel exports and Snapshots
Then /^(?:I |)should( not|) see "([^"]+)" within row (\d+), column (\d+) of the ([\w\d]+) table$/ do |negation, text, row, column, table_position|
  table_selector = string_quantity_to_numeric_pseudo_selector(table_position)
  selector = "table:#{table_selector} tr:nth-child(#{row}) td:nth-child(#{column}), table:#{table_selector} tr:nth-child(#{row}) th:nth-child(#{column})"
  unless negation == ' not' && !page.has_selector?(:selector) # if cell does not exist, then content does not exist so negative test is fine
    step %{I should#{negation} see the text "#{text}" within "#{selector}"}
  end
end

##
# PDF
When /^I follow the PDF link "([^"]+)"$/ do |label|
  click_link(label)
  # code from http://upstre.am/blog/2009/02/testing-pdfs-with-cucumber-and-rails/
  temp_pdf = Tempfile.new('pdf')
  temp_pdf << page.source.force_encoding('UTF-8')
  temp_pdf.close
  pdf_text = PDF::PdfToText.new(temp_pdf.path)
  page.driver.response.instance_variable_set('@body', [pdf_text.get_text])
end

##
# Backlog settings
When /^I change the scoring rule for this backlog to "([^"]+)"$/ do |scoring_rule|
  step %{I follow "Settings"}
  step %{I choose "#{scoring_rule}"}
  step %{I press "Update backlog settings"}
end

##
# Backlog guiders
Then /^I should (|not )see (?:|the text )"([^"]+)" within the visible guider$/ do |negation, text|
  page.evaluate_script(%{ $(".guider:visible:contains('#{text}')").length }).should == (negation == 'not ' ? 0 : 1)
end

Then /^I press the (close button|next button|cross) within the visible guider$/ do |button|
  button_path = case button
  when 'close button'
    "a:contains('Close')"
  when 'next button'
    "a:contains('Next')"
  when 'cross'
    'div.x_button'
  end
  page.evaluate_script(%{ $(".guider:visible #{button_path}").length }).should > 0
  page.execute_script %{ $(".guider:visible #{button_path}").click() }
end