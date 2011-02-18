Factory.define :company_user do |a|
  a.association :user, :factory => :user
  a.association :company, :factory => :company
  a.admin false
end