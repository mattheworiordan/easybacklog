When /^(?:|I )press "([^"]*)"(?: within (?:|the )"([^"]*)")?$/ do |button, selector|
  selector_css = selector_to(selector)
  sleep 0.2 if selector_css.present? && !page.has_css?(selector_css) # https://github.com/thoughtbot/capybara-webkit/issues/36
  with_scope(selector_css) do
    click_button(selector_to(button, :dont_translate_to_css=>true))
  end
end

Then /^I should (|not )see (?:|the text )"([^"]+)"(?:| within (?:|the |a )"([^"]+)")$/ do |negation, text, selector|
  with_scope(selector_to(selector)) do |content|
    if negation.strip == "not"
      page.should_not have_content(text)
    else
      page.should have_content(text)
    end
  end
end

When /^(?:|I )select "([^"]*)" from "([^"]*)"(?: within "([^\"]*)")?$/ do |value, field, selector|
  supports_javascript = page.evaluate_script('true') rescue false
  if (supports_javascript)
    scope = selector_to(selector)
    field = selector_to(field)
    field = "select#{field}" unless field =~ /^select/i
    page.evaluate_script("$('#{scope} #{field}').find('option:contains(#{value})').length").should > 0
    page.execute_script "$('#{scope} #{field}').find('option:contains(#{value})').attr('selected',true).end().change()"
  else
    # found this method to be less reliable than JQuery as the event fired for on('change') was null
    with_scope(selector_to(selector)) do
      select(value, :from => selector_to(field, :dont_translate_to_css=>true))
    end
  end
end

Then /take a snapshot(| and show me the page)/ do |show_me|
  page.driver.render Rails.root.join("tmp/capybara/#{Time.now.strftime('%Y-%m-%d-%H-%M-%S')}.png") if page.driver.respond_to?(:render)
  step %{show me the page} if !show_me.blank?
end
