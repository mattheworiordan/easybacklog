module ActiveRecordExceptions
  class RecordNotDestroyable < StandardError; end
  class RecordLocked < StandardError; end
  class StoriesCannotBeRenumbered < StandardError; end
  class StoryCannotbeMoved < StandardError; end
end