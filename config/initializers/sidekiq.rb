if %w(development test cucumber).include?(Rails.env)
  require 'sidekiq/testing/inline' unless ENV['FOREMAN'].present? # set sidekiq to run job immediately if foreman is not being used meaning Sidekiq is probably not running
end