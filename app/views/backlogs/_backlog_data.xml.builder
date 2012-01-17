builder.themes do
  backlog.themes.each do |theme|
    theme_attributes = {
      :name => theme.name, :code => theme.code, :points => theme.points
    }
    theme_attributes.merge! :days => theme.days_formatted if backlog.days_estimatable?
    theme_attributes.merge! :cost => theme.cost_formatted if backlog.cost_estimatable?

    builder.theme theme_attributes do
      builder.stories do
        theme.stories.each do |story|
          story_attributes = {
            :unique_id => story.unique_id, :code => "#{theme.code}#{story.unique_id}", :as_a => story.as_a, :i_want_to => story.i_want_to,
            :so_i_can => story.so_i_can, :comments => story.comments, :color => story.color
          }
          if backlog.use_50_90
            story_attributes[:score_50] = story.score_50
            story_attributes[:score_90] = story.score_90
          else
            story_attributes[:score] = story.score
          end
          story_attributes.merge! :days => story.days_formatted if backlog.days_estimatable?
          story_attributes.merge! :cost => story.cost_formatted if backlog.cost_estimatable?

          builder.story story_attributes do
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
end