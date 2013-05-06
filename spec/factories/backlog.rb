FactoryGirl.define do
  factory :backlog do
    sequence(:name) { |n| "Backlog-#{n}" }
    rate 800
    velocity 3
    use_50_90 true
    association :account, :factory => :account
    association :author, :factory => :user
    association :last_modified_user, :factory => :user
    after(:create) { |backlog| backlog.account.backlogs.reload } # parent model needs refreshing as it will not know a new model has been created

    trait :with_stories do
      after(:create) do |instance|
        create_list :theme, 2, :with_stories, :backlog => instance
      end
    end

    trait :with_sprints do
      after(:create) do |instance|
        create_list :sprint, 2, :backlog => instance
      end
    end

    trait :with_a_snapshot do
      after(:create) do |instance|
        create(:backlog, :snapshot_master => instance)
      end
    end
  end
end