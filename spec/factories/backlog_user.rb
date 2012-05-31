FactoryGirl.define do |a|
  factory :backlog_user, :aliases => [:backlog_user_with_full_rights] do
    association :backlog
    association :user
    privilege 'full'

    factory :backlog_user_with_read_rights do
      privilege 'read'
    end

    factory :backlog_user_with_read_status_rights do
      privilege 'readstatus'
    end

    factory :backlog_user_with_no_rights do
      privilege 'none'
    end
  end
end