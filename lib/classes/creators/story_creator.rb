module Creators
  class StoryCreator
    include XmlObjectImprover

    def create(story_data, target_theme)
      @story = target_theme.stories.build
      set_story_properties story_data

      # build criterion
      arr(story_data, :criteria).each do |criterion|
        @story.acceptance_criteria.create! :criterion => criterion
      end

      @story
    end

    def set_story_properties(story)
      @story.unique_id = story.unique_id
      @story.as_a = story.as_a
      @story.i_want_to = story.i_want_to
      @story.so_i_can = story.so_i_can
      @story.comments = story.comments
      @story.color = story.color
      if @story.theme.backlog.use_50_90
        @story.score_50 = story.score_50
        @story.score_90 = story.score_90
      else
        @story.score = story.score
      end
      @story.save!
    end
  end
end