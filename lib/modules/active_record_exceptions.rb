module ActiveRecordExceptions
  class RecordNotDestroyable < StandardError; end
  class RecordLocked < StandardError; end
end