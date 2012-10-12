Then /^the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) welcome feature should be selected$/ do |position|
  position = string_quantity_to_numeric(position)
  # check nav is selected
  page.evaluate_script("$('.feature-nav ul li:nth-child(#{position})').is('.selected')").should be_true
  # now check that correct card is visible, first 2 children are not cards
  page.evaluate_script("$('.dual-cards .card:nth-child(#{position+2})').is('.visible');").should be_true
end
