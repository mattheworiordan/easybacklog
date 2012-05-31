FactoryGirl.define do |a|
  factory :account_user, :aliases => [:account_user_with_full_rights] do
    association :account
    association :user
    admin false
    privilege 'full'

    factory :account_user_with_read_rights do
      privilege 'read'
    end

    factory :account_user_with_read_status_rights do
      privilege 'readstatus'
    end

    factory :account_user_with_no_rights do
      privilege 'none'
    end

    factory :account_user_with_account_admin_rights do
      privilege 'full'
      admin true
    end
  end
end