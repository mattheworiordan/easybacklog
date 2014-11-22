# See: https://gist.github.com/1401792

run_sidekiq_in_this_thread = true

worker_processes 2 # amount of unicorn workers to spin up, reduce if staging for sidekiq
timeout 30         # restarts workers that hang for 30 seconds
preload_app true   # for newrelic to work with Unicorn

@sidekiq_pid = nil

before_fork do |server, worker|
  # Replace with MongoDB or whatever
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
    Rails.logger.info('Disconnected from ActiveRecord')
  end

  # If you are using Redis but not Resque, change this
  if defined?(Resque)
    Resque.redis.quit
    Rails.logger.info('Disconnected from Redis')
  end

  # if staging, then save money by spawning sidekiq in the web process
  if run_sidekiq_in_this_thread
    @resque_pid ||= spawn("bundle exec sidekiq -c 1 -q mailer -q default")
    Rails.logger.info('Spawned sidekiq #{@request_pid}')
  end
end

after_fork do |server, worker|
  # Replace with MongoDB or whatever
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.establish_connection
    Rails.logger.info('Connected to ActiveRecord')
  end

  # If you are using Redis but not Resque, change this
  if defined?(Resque)
    Resque.redis = ENV['REDIS_URI']
    Rails.logger.info('Connected to Redis')
  end
end
