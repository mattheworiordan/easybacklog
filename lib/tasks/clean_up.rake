desc "Clean up old data such as deleted backlogs and cron entries, called by Heroku scheduler"

task :clean_up => :environment do
  puts "Cleaning up old data..."

  backlogs_deleted = 0
  cron_logs_deleted = 0

  begin
    # 30 days retention for deleted backlogs
    Backlog.where(:deleted => true).where('updated_at < ?', Time.now - 30.days).each do |backlog|
      puts "Deleting backlog #{backlog.id}: #{backlog.name}"
      backlog.destroy_including_snapshots
      backlogs_deleted += 1
    end

    # 14 days retention on the cron log
    CronLog.where('updated_at < ?', Time.now - 14.days).each do |cron|
      cron.destroy
      cron_logs_deleted += 1
    end

    message = "Finished cleaning up #{backlogs_deleted} backlog(s), and #{cron_logs_deleted} cron log(s)"
    puts message
    CronLog.create!(:message => message)
  rescue Exception => e
    message = "!! Error cleaning up old data"
    puts "#{message} - #{e.message}"
    CronLog.create!(:message => message, :info => e.message)
  end
end