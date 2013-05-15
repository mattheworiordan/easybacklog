if %w(development test cucumber).include?(Rails.env)
  unless ENV['FOREMAN'].present? # set sidekiq to run job immediately if foreman is not being used meaning Sidekiq is probably not running
    puts ">> Sidekiq inlining - queue will not be used"
    require 'sidekiq/testing/inline'
  end
end