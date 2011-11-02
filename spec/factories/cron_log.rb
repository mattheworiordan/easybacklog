FactoryGirl.define do
  factory :cron_log do
    sequence(:message){|n| "Message #{n}" }
  end
end
