FactoryGirl.define do
  factory :theme do
    sequence(:name) { |n| "Theme-#{n}" }
    sequence(:position)
    association :backlog, :factory => :backlog
    after(:create) { |theme| theme.backlog.themes.reload } # parent model needs refreshing as it will not know a new model has been created

    trait :with_stories do
      after(:create) do |instance|
        create_list :story, 3, :theme => instance
      end
    end
  end
end