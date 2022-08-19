EasyBacklog::Application.configure do
  # Settings specified here will take precedence over those in config/environment.rb

  # The production environment is meant for finished, "live" apps.
  # Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Specifies the header that your server uses for sending files and Sidekiq
  config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect'

  # Disable Rails's static asset server
  # In production, Apache or nginx will already do this
  config.serve_static_assets = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  config.action_mailer.default_url_options = { :host => config.dns }

  # Heroku support
  config.assets.initialize_on_precompile = false
  config.assets.compile = false # compile assets at Heroku

  # config.asset_host = 'd2bnjfukjumf2u.cloudfront.net'
  config.assets.compress = true
  config.fonts_domain = '//easybacklog-staging.herokuapp.com'

  # ensure MD5 fingerprinting is on
  config.assets.digest = true

  config.lograge.enabled = true
end
