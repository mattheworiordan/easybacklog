FactoryGirl.define do
  factory :user do |a|
    name 'John'
    sequence(:email) { |n| "john.doe#{n}@acme.com" }
    password 'password'
    password_confirmation 'password'
  end
end