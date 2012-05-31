FactoryGirl.define do
  factory :theme do
    sequence(:name) { |n| "Theme-#{n}" }
    sequence(:position)
    association :backlog, :factory => :backlog
    after(:create) { |theme| theme.backlog.themes.reload } # parent model needs refreshing as it will not know a new model has been created
  end
end