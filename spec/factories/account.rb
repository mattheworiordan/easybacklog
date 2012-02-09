FactoryGirl.define do
  factory :account do
    sequence(:name){|n| "Acme-#{n}" }
    default_velocity 3
    default_rate 800
    default_use_50_90 true
    association :locale, :factory => :locale
  end

  factory :account_with_user, :parent => 'account' do
    after_create { |c| Factory(:account_user, :account => c) }
  end

  factory :account_with_user_with_no_rights, :parent => 'account' do
    after_create { |c| Factory(:account_user_with_no_rights, :account => c) }
  end

  factory :account_with_user_with_read_rights, :parent => 'account' do
    after_create { |c| Factory(:account_user_with_read_rights, :account => c) }
  end

  factory :account_with_user_with_full_rights, :parent => 'account' do
    after_create { |c| Factory(:account_user_with_full_rights, :account => c) }
  end
end
