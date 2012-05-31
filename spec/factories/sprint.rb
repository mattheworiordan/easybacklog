FactoryGirl.define do
  factory :sprint do
    sequence(:start_on) { |n| Date.today + (n*10).days }
    number_team_members 2
    duration_days 10
    association :backlog, :factory => :backlog
  end
end