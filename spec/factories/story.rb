FactoryGirl.define do
  factory :story do
    sequence(:position)
    as_a 'User'
    i_want_to 'Search'
    so_i_can 'Find stuff'
    sequence(:comments) { |n| "Whatever #{n}" }
    score_50 5
    score_90 13
    association :theme, :factory => :theme
    after(:create) { |story| story.theme.stories.reload; } # parent model needs refreshing as it will not know a new model has been created
  end
end