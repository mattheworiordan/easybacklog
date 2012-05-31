FactoryGirl.define do
  factory :invited_user do
    association :invitee_user, :factory => :user
    association :account, :factory => :account
    email 'john.doe@test.com'
  end
end