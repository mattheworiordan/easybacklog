Given /^a standard backlog named "([^\"]+)" is set up for "([^\"]+)"$/ do |backlog_name, company_name|
  company = Company.find_by_name(company_name)
  raise "Company #{company_name} does not exist." if company.blank?

  backlog = Factory.create(:backlog, :company => company, :name => backlog_name)
  (1..2).each do |index|
    theme = Factory.create(:theme, :backlog => backlog)
    (1..3).each { |ac| Factory.create(:acceptance_criterion, :story => Factory.create(:story, :theme => theme) ) }
  end
end