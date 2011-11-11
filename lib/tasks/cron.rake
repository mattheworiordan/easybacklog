desc "Check to see if any sprints need snapshots and snapshot (called by Heroku scheduler)"

task :cron => :environment do
  puts "Checking for sprints that need snapshot..."

  begin
    processed = 0
    # run every hour
    Sprint.in_need_of_snapshot.each do |sprint|
      puts "Created snapshot for sprint #{sprint.iteration} of Backlog #{sprint.backlog.id}: `#{sprint.backlog.name}`"
      sprint.create_snapshot_if_missing
      processed += 1
    end

    CronLog.create!(:message => "Snapshotted #{processed} sprint(s)")
  rescue Exception => e
    CronLog.create!(:message => "!! Error snapshotting sprints", :info => e.message)
  end
end