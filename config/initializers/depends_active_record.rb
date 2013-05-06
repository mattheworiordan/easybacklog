# all initializers that depend on ActiveRecord cause rake assets:precompile to fail on Heroku as a database connection is not available
unless Rails.groups.include?('assets')
  Dir.glob(File.expand_path('../../active_record_initializers/*.rb', __FILE__)).each do |file|
    require file
  end
end