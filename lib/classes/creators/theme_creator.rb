module Creators
  class ThemeCreator
    include XmlObjectImprover

    def create(theme_data, target_backlog)
      @theme = target_backlog.themes.build
      set_theme_properties theme_data

      # build stories
      arr(theme_data, :stories).each do |story|
        creator = StoryCreator.new
        creator.create story, @theme
      end

      @theme
    end

    def set_theme_properties(theme)
      @theme.name = theme.name
      @theme.code = theme.code
      @theme.save!
    end
  end
end