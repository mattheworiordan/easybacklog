# if using foreman, then send using SMTP as part of the worker queue
if Rails.env.test? || Rails.env.development? && ENV['FOREMAN'].blank?
  puts ">> Mail will not be delivered as we are in #{Rails.env} mode"
else
  ActionMailer::Base.smtp_settings = {
    :address        => 'smtp.sendgrid.net',
    :port           => '587',
    :authentication => :plain,
    :user_name      => ENV['SENDGRID_USERNAME'],
    :password       => ENV['SENDGRID_PASSWORD'],
    :domain         => 'heroku.com'
  }
  ActionMailer::Base.delivery_method = :smtp
end