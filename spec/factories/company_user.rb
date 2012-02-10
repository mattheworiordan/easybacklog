FactoryGirl.define do |a|
  factory :company_user do
    association :company
    association :user
    privilege 'full'
  end

  factory :company_user_with_read_rights, :parent => :company_user do
    privilege 'read'
  end

  factory :company_user_with_read_status_rights, :parent => :company_user do
    privilege 'readstatus'
  end

  factory :company_user_with_no_rights, :parent => :company_user do
    privilege 'none'
  end

  factory :company_user_with_full_rights, :parent => :company_user do
  end
end