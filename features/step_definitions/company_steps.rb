Given /^"([^\"]+)" is given (read only|read only and status update|full access|no) rights for (company|backlog) "([^\"]+)"$/ do |user_name, rights, company_or_backlog, company_or_backlog_name|
  object_class = if company_or_backlog == 'company'
    Company
  else
    Backlog
  end
  object = object_class.find_by_name(company_or_backlog_name)
  user = User.find_by_name(user_name)

  case rights
    when 'read only'
      object.add_or_update_user user, :read
    when 'read only and status update'
      object.add_or_update_user user, :readstatus
    when 'full access'
      object.add_or_update_user user, :full
    when 'no'
      object.add_or_update_user user, :none
  end
end