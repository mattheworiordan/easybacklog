FactoryGirl.define do
  factory :scoring_rule do |a|
    sequence(:title) { |n| "Title #{n}" }
    sequence(:description) { |n| "Description #{n}" }
    sequence(:code) { |n| "#{n}" }
  end

  factory :scoring_rule_fib, :parent => 'scoring_rule' do
    title 'Fibonacci'
    description '0,1,2,3,5,8,13,21'
    code ScoringRule::FIBONACCI
  end

  factory :scoring_rule_modified_fib, :parent => 'scoring_rule' do
    title 'Modified Fibonacci'
    description '0,0.5,1,2,3,5,8,13,20/21,40,100'
    code ScoringRule::MODIFIED_FIB
  end
  factory :scoring_rule_default, :parent => 'scoring_rule_modified_fib'

  factory :scoring_rule_any, :parent => 'scoring_rule' do
    title 'Any number'
    description 'Score with any arbitrary number'
    code ScoringRule::ANY
  end
end