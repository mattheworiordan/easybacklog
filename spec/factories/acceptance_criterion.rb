FactoryGirl.define do
  factory :acceptance_criterion do
    sequence(:criterion) { |n| "Must do something #{n}" }
    sequence(:position)
    association :story, :factory => :story
    after(:create) { |ac| ac.story.acceptance_criteria.reload } # parent model needs refreshing as it will not know a new model has been created
  end
end