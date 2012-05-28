##
# Creators are used to create new Backlog and children items from XML Objects (Ruby DSL for XML)
# This is used to generate a demo backlog for each new account created
#
module Creators
  class BacklogCreator
    include XmlObjectImprover

    # create a normal backlog, not a snapshot
    def create(source_backlog, target_account, current_user)
      begin
        Backlog.record_timestamps = false

        @backlog = target_account.backlogs.build

        set_backlog_properties source_backlog, current_user
        # last update time needs to be set manually
        set_backlog_timestamps source_backlog

        # build themes
        add_themes source_backlog

        # build snapshots
        add_manual_snapshots source_backlog

        # build sprints
        add_sprints source_backlog
      ensure
        Backlog.record_timestamps = true
      end

      @backlog
    end

    # create a new manually created snapshot
    def create_manual_snapshot(source_snapshot, target_backlog)
      begin
        Backlog.record_timestamps = false
        # create a backlog that is editable
        @backlog = target_backlog.account.backlogs.build
        set_backlog_properties source_snapshot, target_backlog.author
        set_backlog_timestamps source_snapshot # do before themes are added so that the right time stamp is used
        add_themes source_snapshot
        # set the backlog to a snapshot and it will no longer be editable
        @backlog.snapshot_master = target_backlog
        @backlog.save!
      ensure
        Backlog.record_timestamps = true
      end
      @backlog
    end

    # create a sprint snapshot
    def create_sprint_snapshot(source_snapshot, target_sprint)
      begin
        Backlog.record_timestamps = false
        @backlog = target_sprint.backlog.account.backlogs.build
        set_backlog_properties source_snapshot, target_sprint.backlog.author
        set_backlog_timestamps source_snapshot # do before themes are added so that the right time stamp is used
        add_themes source_snapshot
        # set the backlog to a sprint snapshot and it will no longer be editable
        @backlog.snapshot_for_sprint = target_sprint
        @backlog.save!
      ensure
        Backlog.record_timestamps = true
      end
      @backlog
    end

    private
      # old method to add themes using active record objects instead of a big SQL statement
      def add_themes_with_active_record(source_backlog)
        arr(source_backlog, :themes).each do |theme|
          creator = ThemeCreator.new
          creator.create theme, @backlog
        end
      end

      def add_themes(source_backlog)
        sql = ""
        creator = ThemeCreator.new
        arr(source_backlog, :themes).each_with_index do |theme, index|
          sql << creator.create_sql(theme, index+1, @backlog)
        end
        @backlog.connection.execute sql
      end

      def add_manual_snapshots(source_backlog)
        arr(source_backlog, :snapshots).each do |snapshot|
          creator = BacklogCreator.new
          creator.create_manual_snapshot snapshot, @backlog
        end
      end

      def add_sprints(source_backlog)
        # sprints must be built in ascending order due to sprint rules
        arr(source_backlog, :sprints).sort_by(&:iteration).each do |sprint|
          creator = SprintCreator.new
          creator.create sprint, @backlog
        end
      end

      def set_backlog_properties(source_backlog, current_user)
        # set the account if not explicitly set (i.e. sprint snapshots and manual snapshots)
        @backlog.name = source_backlog.name
        @backlog.velocity = source_backlog.velocity
        @backlog.rate = source_backlog.rate
        @backlog.use_50_90 = source_backlog.use_50_90
        @backlog.author = current_user
        @backlog.last_modified_user = current_user
        @backlog.save!
      end

      def set_backlog_timestamps(source_backlog)
        @backlog.created_at = source_backlog.created_at
        @backlog.updated_at = source_backlog.updated_at
        @backlog.save!
      end
  end
end