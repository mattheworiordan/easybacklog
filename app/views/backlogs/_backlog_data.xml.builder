builder.themes do
  backlog.themes.each do |theme|
    builder.theme :name => theme.name, :code => theme.code do
      builder.stories do
        theme.stories.each do |story|
          story_attributes = {
            :unique_id => story.unique_id, :code => "#{theme.code}#{story.unique_id}", :as_a => story.as_a, :i_want_to => story.i_want_to,
            :so_i_can => story.so_i_can, :comments => story.comments, :cost => story.cost_formatted, :days => story.days_formatted
          }
          if backlog.use_50_90
            story_attributes[:score_50] = story.score_50
            story_attributes[:score_90] = story.score_90
          else
            story_attributes[:score] = story.score
          end
          builder.story story_attributes
          builder.criteria do
            story.acceptance_criteria.each do |criterion|
              builder.criterion criterion.criterion
            end
          end
        end
      end
    end
  end
end