# safety measures for the limited connections avaialable to the app from Heroku

unless Rails.groups.include?('assets')
  Rails.application.config.after_initialize do
    ActiveRecord::Base.connection_pool.disconnect!

    ActiveSupport.on_load(:active_record) do
      config = Rails.application.config.database_configuration[Rails.env]
      config['reaping_frequency'] = ENV['DB_REAP_FREQ'] || 10 # seconds
      config['pool']              = ENV['DB_POOL'] || 4
      ActiveRecord::Base.establish_connection(config)
    end
  end
end