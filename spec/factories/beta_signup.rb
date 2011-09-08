FactoryGirl.define do
  factory :beta_signup do
    sequence(:email) { |n| "email#{n}@acme.com" }
    company 'Acme'
  end
end