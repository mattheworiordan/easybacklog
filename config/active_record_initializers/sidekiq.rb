require 'sidekiq'

SIDEKIQ_REDIS_NAMESPACE = 'easybacklog'

Sidekiq.configure_client do |config|
  config.redis = { size: 1, namespace: SIDEKIQ_REDIS_NAMESPACE }

  database_url = ENV['DATABASE_URL']
  if(database_url)
    ENV['DATABASE_URL'] = "#{database_url}?pool=4"
    ActiveRecord::Base.establish_connection
  end
end

Sidekiq.configure_server do |config|
  config.redis = { size: 2, namespace: SIDEKIQ_REDIS_NAMESPACE }
end