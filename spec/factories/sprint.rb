Factory.sequence :sprint_start_date do |n|
  Date.today + (n*10).days
end

Factory.define :sprint do |a|
  a.start_on { Factory.next(:sprint_start_date) }
  a.number_team_members 2
  a.duration_days 10
  a.association :backlog, :factory => :backlog
  a.association :sprint_status, :factory => :sprint_status
end