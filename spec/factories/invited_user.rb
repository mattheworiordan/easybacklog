Factory.define :invited_user do |a|
  a.association :invitee_user, :factory => :user
  a.association :account, :factory => :account
  a.email 'john.doe@test.com'
end