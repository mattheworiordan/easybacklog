FactoryGirl.define do
  factory :sprint_story do
    association :sprint
    association :story
    association :sprint_story_status
  end
end