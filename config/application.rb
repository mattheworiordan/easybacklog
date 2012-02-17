require File.expand_path('../boot', __FILE__)

require 'rails/all'

# If you have a Gemfile, require the gems listed there, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env) if defined?(Bundler)

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require *Rails.groups(:assets => %w(development test))
end

module Ibacklog
  class Application < Rails::Application
    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += %W(#{Rails.root}/lib/modules #{Rails.root}/lib/classes #{Rails.root}/app/reports)

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', 'framework', '*.{rb,yml}').to_s]
    config.i18n.default_locale = :en

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password, :password_confirmation]

    config.middleware.use Rack::ForceDomain, ENV["DOMAIN"]

    Dir["#{Rails.root}/lib/core_extensions/*.rb"].each { |file| require file }

    config.fonts_domain = ""

    config.assets.enabled = true

    # pre-compile all javascript/scss files in assets/stylesheets, assets/javascripts, assets/javascripts/sections
    ['stylesheets','javascripts','javascripts/sections'].each do |path|
      Rails.root.join('app','assets',path).each_child do |d|
        prefix_path = path.split('/')
        if d.basename.to_s =~ /\.(scss|scss\.erb|js|js\.erb)$/
          file_name = d.basename.to_s.gsub(/\.(scss|scss\.erb|erb)$/, '') # remove preprocessor extensions
          config.assets.precompile += ["#{prefix_path.length > 1 ? "#{prefix_path[1]}/" : ''}#{file_name}"]
        end
      end
    end
  end
end
