module ActiveRecordExceptions
  class RecordNotDestroyable < StandardError; end
  class RecordLocked < StandardError; end
  class StoriesCannotBeRenumbered < StandardError; end
  class StoryCannotBeMoved < StandardError; end
  class ThemeCannotBeMoved < StandardError; end
end