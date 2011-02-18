Factory.sequence :company_name do |n|
  "Acme-#{n}"
end

Factory.define :company do |a|
  a.name { Factory.next(:company_name) }
  a.default_velocity 3
  a.default_rate 800
  a.association :locale, :factory => :locale
  a.after_create { |c| Factory(:company_user, :company => c) }
end