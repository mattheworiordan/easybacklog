FactoryGirl.define do |a|
  factory :backlog_user do
    association :backlog
    association :user
    privilege 'full'
  end

  factory :backlog_user_with_read_rights, :parent => :backlog_user do
    privilege 'read'
  end

  factory :backlog_user_with_read_status_rights, :parent => :backlog_user do
    privilege 'readstatus'
  end

  factory :backlog_user_with_no_rights, :parent => :backlog_user do
    privilege 'none'
  end

  factory :backlog_user_with_full_rights, :parent => :backlog_user do
  end
end