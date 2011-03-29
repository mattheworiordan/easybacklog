module Snapshot
  def self.included(base)
    base.send :before_save, :check_can_modify
  end

  # raise an exception if trying to delete as returning false does not stop the destroy event from executing
  def destroy
    raise Exception.new('Cannot modify a snapshot') unless editable?
    super
  end

  private
    # only allow save on working copy i.e. not snapshot
    def check_can_modify
      self.errors[:base] << 'Cannot modify a snapshot' unless editable?
      editable?
    end
end