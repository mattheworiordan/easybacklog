Factory.sequence :backlog_name do |n|
  "Backlog-#{n}"
end

Factory.define :backlog do |a|
  a.name { Factory.next(:backlog_name) }
  a.rate 800
  a.velocity 3
  a.association :company, :factory => :company
  a.association :author, :factory => :user
  a.association :last_modified_user, :factory => :user
end