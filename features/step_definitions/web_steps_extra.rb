When /^(?:|I )press "([^"]*)"(?: within (?:|the )"([^"]*)")?$/ do |button, selector|
  with_scope(selector_to(selector)) do
    click_button(selector_to(button))
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

When /^(?:|I )select "([^"]*)" from "([^"]*)"(?: within "([^"]*)")?$/ do |value, field, selector|
  with_scope(selector_to(selector)) do
    select(value, :from => selector_to(field))
  end
end

Then /take a snapshot(| and show me the page)/ do |show_me|
  page.driver.render Rails.root.join("tmp/capybara/#{Time.now.strftime('%Y-%m-%d-%H-%M-%S')}.png") if page.driver.respond_to?(:render)
  Then %{show me the page} if !show_me.blank?
end
