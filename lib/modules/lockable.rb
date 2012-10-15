module Lockable
  def self.included(base)
    base.send :before_save, :check_can_modify
  end

  # raise an exception if trying to delete as returning false does not stop the destroy event from executing
  def destroy
    raise ActiveRecordExceptions::BacklogLocked.new(not_editable_reason) unless destroyable?
    super
  end

  private
    # only allow save on working copy i.e. not snapshot
    def check_can_modify
      self.errors[:base] << not_editable_reason unless editable?
      editable?
    end

    def not_editable_reason
      if backlog.is_snapshot?
        "Snapshots cannot be modified"
      else
        "This backlog is not editable as it is archived or deleted"
      end
    end
end