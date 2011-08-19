Given /^a standard backlog named "([^\"]+)" is set up for "([^\"]+)"$/ do |backlog_name, company_name|
  company = Company.find_by_name(company_name)
  raise "Company #{company_name} does not exist." if company.blank?

  backlog = Factory.create(:backlog, :company => company, :name => backlog_name)
  (1..2).each do |index|
    theme = Factory.create(:theme, :backlog => backlog)
    (1..3).each { |ac| Factory.create(:acceptance_criterion, :story => Factory.create(:story, :theme => theme) ) }
  end
end

When /(?:|I )change the current editable text to "([^"]+)"/ do |text|
  page.execute_script %{$('form input[name=value]').attr('value','#{text}').blur()}
  # wait for AJAX to post update after blur
  sleep 0.5
end

When /(?:|I )tab (forwards|backwards)/ do |forward_or_back|
  page.execute_script <<-JS
    var e = $.Event('keypress', { keyCode: 9, target: $(':focus') });
    $('form input[name=value]').trigger(e);
  JS
end

When /^(?:|I )change the editable text "([^"]+)" within tag "([^"]+)" to "([^"]+)"$/ do |text, tag, new_text|
  # blur any currently editable input field
  page.execute_script %{$('form input[name=value]').blur()}
  # click on the div to bring up the input field
  page.execute_script %{$('#{tag}:contains("#{text}")>div').click();}
  sleep 0.25
  When %{I change the current editable text to "#{new_text}"}
end

Then /the field focussed on should be an? "([^"]+)"/ do |selector|
  page.execute_script "$('form input[name=value]').focus();"
  page.evaluate_script("$(':focus').is('#{selector}')").should == true
end

Then /the field focussed on should descend from "([^"]+)"/ do |selector|
  page.evaluate_script("$(':focus').parents('#{selector}').length").should > 0
end