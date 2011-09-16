FactoryGirl.define do |a|
  factory :account_user do
    association :account
    association :user
    admin false
  end
end