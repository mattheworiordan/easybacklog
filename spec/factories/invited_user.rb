Factory.define :invited_user do |a|
  a.association :invitee_user, :factory => :user
  a.association :company, :factory => :company
  a.email 'john.doe@test.com'
end