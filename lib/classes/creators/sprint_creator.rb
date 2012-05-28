module Creators
  class SprintCreator
    include XmlObjectImprover

    def create(sprint_data, target_backlog)
      @sprint = target_backlog.sprints.build
      set_sprint_properties sprint_data, target_backlog

      # add sprint stories
      arr(sprint_data, :sprint_stories).each do |sprint_story_data|
        begin
          SprintStory.record_timestamps = false
          sprint_story = @sprint.sprint_stories.build
          sprint_story.sprint_story_status = SprintStoryStatus.find_by_code(sprint_story_data.status_code)
          sprint_story.story = target_backlog.find_story_by_code_and_unique_id(sprint_story_data.code)
          sprint_story.updated_at = target_backlog.updated_at
          sprint_story.created_at = target_backlog.created_at
          sprint_story.save!
          # score_*_when_assigned is not writeable, use update_attribute to avoid validation
          sprint_story.update_attribute :sprint_score_50_when_assigned, sprint_story_data.score_50_when_assigned
          sprint_story.update_attribute :sprint_score_90_when_assigned, sprint_story_data.score_90_when_assigned
        ensure
          SprintStory.record_timestamps = false
        end
      end

      # add snapshot
      # stupid XMLObject peculiarilty means we have to catch an error to see if the object exists
      snapshot_name = sprint_data.snapshot.name rescue nil
      if snapshot_name.present?
        creator = BacklogCreator.new
        creator.create_sprint_snapshot sprint_data.snapshot, @sprint
        @sprint.reload # object needs to know about new sprint object
      end

      mark_completed sprint_data if sprint_data.completed?
      @sprint
    end

    private
      def set_sprint_properties(sprint, target_backlog)
        @sprint.start_on = sprint.start_on
        @sprint.duration_days = sprint.duration_days
        @sprint.number_team_members = sprint.number_team_members
        @sprint.updated_at = target_backlog.updated_at
        @sprint.created_at = target_backlog.created_at
        @sprint.save!
      end

      def mark_completed(sprint)
        begin
          Sprint.record_timestamps = false
          @sprint.update_attribute :completed_at, sprint.completed_at
        ensure
          Sprint.record_timestamps = true
        end
      end
  end
end