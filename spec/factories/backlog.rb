Factory.sequence :backlog_name do |n|
  "Backlog-#{n}"
end

Factory.define :backlog do |a|
  a.name { Factory.next(:backlog_name) }
  a.rate 800
  a.velocity 3
  a.use_50_90 true
  a.association :account, :factory => :account
  a.association :author, :factory => :user
  a.association :last_modified_user, :factory => :user
  a.after_create { |backlog| backlog.account.backlogs.reload } # parent model needs refreshing as it will not know a new model has been created
end