module Creators
  class StoryCreator
    include XmlObjectImprover
    include Sql

    def create(story_data, target_theme)
      @story = target_theme.stories.build
      set_story_properties story_data

      # build criterion
      arr(story_data, :acceptance_criteria).each do |criterion|
        @story.acceptance_criteria.create! :criterion => criterion
      end

      @story
    end

    def create_sql(story_data, position, use_50_90)
      options = {
        :theme_id => :themes,
        :unique_id => story_data.unique_id,
        :as_a => story_data.as_a,
        :i_want_to => story_data.i_want_to,
        :so_i_can => story_data.so_i_can,
        :comments => story_data.comments,
        :color => story_data.color,
        :position => position
      }

      if use_50_90
        options.merge! :score_50 => story_data.score_50, :score_90 => story_data.score_90
      else
        options.merge! :score_50 => story_data.score, :score_90 => story_data.score
      end

      sql = insert_sql 'stories', options

      # build criterion
      arr(story_data, :acceptance_criteria).each_with_index do |criterion, index|
        sql << insert_sql('acceptance_criteria', :story_id => :stories, :criterion => criterion, :position => index + 1)
      end

      sql
    end

    private
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