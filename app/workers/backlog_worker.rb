class BacklogWorker
  class CopyChildrenToBacklog
    include Sidekiq::Worker

    def perform(source_backlog_id, target_backlog_id)
      source_backlog = Backlog.find(source_backlog_id)
      target_backlog = Backlog.find(target_backlog_id)

      source_backlog.copy_children_to_backlog target_backlog

      # mark the backlog as no longer not_ready?
      target_backlog.update_attribute :not_ready_status, nil
      target_backlog.update_attribute :not_ready_since, nil
    end
  end
end