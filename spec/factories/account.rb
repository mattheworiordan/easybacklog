FactoryGirl.define do
  factory :account do
    sequence(:name){|n| "Acme-#{n}" }
    default_velocity 3
    default_rate 800
    default_use_50_90 true
    association :locale, :factory => :locale

    trait :with_no_defaults_set do
      default_velocity nil
      default_rate nil
      default_use_50_90 nil
      defaults_set nil
    end
  end

  factory :account_with_user, :parent => 'account' do
    after(:create) { |c| FactoryGirl.create(:account_user, :account => c) }
  end

  factory :account_with_user_with_no_rights, :parent => 'account' do
    after(:create) { |c| FactoryGirl.create(:account_user_with_no_rights, :account => c) }
  end

  factory :account_with_user_with_read_rights, :parent => 'account' do
    after(:create) { |c| FactoryGirl.create(:account_user_with_read_rights, :account => c) }
  end

  factory :account_with_user_with_full_rights, :parent => 'account' do
    after(:create) { |c| FactoryGirl.create(:account_user_with_full_rights, :account => c) }
  end
end
