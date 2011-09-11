Factory.sequence :account_name do |n|
  "Acme-#{n}"
end

Factory.define :account do |a|
  a.name { Factory.next(:account_name) }
  a.default_velocity 3
  a.default_rate 800
  a.default_use_50_90 true
  a.association :locale, :factory => :locale
  a.after_create { |c| Factory(:account_user, :account => c) }
end