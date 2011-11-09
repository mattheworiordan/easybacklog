##
# Creators are used to create new Backlog and children items from XML Objects (Ruby DSL for XML)
# This is used to generate a demo backlog for each new account created
#
module Creators
  class BacklogCreator
    include XmlObjectImprover

    # create a normal backlog, not a snapshot
    def create(source_backlog, target_account, current_user)
      @backlog = target_account.backlogs.build
      set_backlog_properties source_backlog, current_user

      # build themes
      add_themes source_backlog

      # build snapshots
      add_manual_snapshots source_backlog

      # build sprints
      add_sprints source_backlog

      # last update time needs to be set manually
      set_backlog_timestamps source_backlog
      @backlog
    end

    # create a new manually created snapshot
    def create_manual_snapshot(source_snapshot, target_backlog)
      # create a backlog that is editable
      @backlog = target_backlog.account.backlogs.build
      set_backlog_properties source_snapshot, target_backlog.author
      add_themes source_snapshot
      set_backlog_timestamps source_snapshot, true # pass true to ensure @backlog is not saved and updated_at and created_at are saved when snapshot is saved
      # set the backlog to a snapshot and it will no longer be editable
      @backlog.snapshot_master = target_backlog
      @backlog.save!
      @backlog
    end

    # create a sprint snapshot
    def create_sprint_snapshot(source_snapshot, target_sprint)
      @backlog = target_sprint.backlog.account.backlogs.build
      set_backlog_properties source_snapshot, target_sprint.backlog.author
      add_themes source_snapshot
      set_backlog_timestamps source_snapshot, true # pass true to ensure @backlog is not saved and updated_at and created_at are saved when snapshot is saved
      # set the backlog to a sprint snapshot and it will no longer be editable
      @backlog.snapshot_for_sprint = target_sprint
      @backlog.save!
      @backlog
    end

    private
      def add_themes(source_backlog)
        arr(source_backlog, :themes).each do |theme|
          creator = ThemeCreator.new
          creator.create theme, @backlog
        end
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

      def set_backlog_timestamps(source_backlog, dont_save = false)
        @backlog.created_at = source_backlog.created_at
        @backlog.updated_at = source_backlog.updated_at
        @backlog.save! unless dont_save
      end
  end
end