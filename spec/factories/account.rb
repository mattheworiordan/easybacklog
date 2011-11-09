FactoryGirl.define do
  factory :account do
    sequence(:name){|n| "Acme-#{n}" }
    default_velocity 3
    default_rate 800
    default_use_50_90 true
    association :locale, :factory => :locale
  end

  factory :account_with_users, :parent => 'account' do
    after_create { |c| Factory(:account_user, :account => c) }
  end
end
