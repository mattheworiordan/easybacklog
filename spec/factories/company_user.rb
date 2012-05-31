FactoryGirl.define do |a|
  factory :company_user, :aliases => [:company_user_with_full_rights] do
    association :company
    association :user
    privilege 'full'

    factory :company_user_with_read_rights do
      privilege 'read'
    end

    factory :company_user_with_read_status_rights do
      privilege 'readstatus'
    end

    factory :company_user_with_no_rights do
      privilege 'none'
    end
  end
end