FactoryGirl.define do |a|
  factory :account_user do
    association :account
    association :user
    admin false
    privilege 'full'
  end

  factory :account_user_with_read_rights, :parent => :account_user do
    privilege 'read'
  end

  factory :account_user_with_read_status_rights, :parent => :account_user do
    privilege 'readstatus'
  end

  factory :account_user_with_no_rights, :parent => :account_user do
    privilege 'none'
  end

  factory :account_user_with_full_rights, :parent => :account_user do
  end

  factory :account_user_with_account_admin_rights, :parent => :account_user do
    privilege 'full'
    admin true
  end
end