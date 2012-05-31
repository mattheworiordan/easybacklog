FactoryGirl.define do
  factory :sprint_story_status do
    status { |n| "Accepted#{n}" }
    code { |n|"D#{n}" }

    factory :sprint_story_status_accepted do
      status 'Accepted'
      code SprintStoryStatus::ACCEPTED
    end
  end
end