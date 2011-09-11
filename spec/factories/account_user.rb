Factory.define :account_user do |a|
  a.association :user, :factory => :user
  a.association :account, :factory => :account
  a.admin false
end