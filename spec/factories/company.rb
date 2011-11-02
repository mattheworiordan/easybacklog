FactoryGirl.define do
  factory :company do
    sequence(:name){|n| "Company-#{n}" }
    default_velocity 3
    default_rate 800
    default_use_50_90 true
    association :account, :factory => :account
  end
end
