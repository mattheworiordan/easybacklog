module Creators
  class ThemeCreator
    include XmlObjectImprover
    include Sql

    def create(theme_data, target_backlog)
      @theme = target_backlog.themes.build
      set_theme_properties theme_data, target_backlog

      # build stories
      arr(theme_data, :stories).each do |story|
        creator = StoryCreator.new
        creator.create story, @theme
      end
    end

    # for performance reasons a theme can be generated entirely from a single SQL statement
    def create_sql(theme_data, position, target_backlog)
      sql = insert_sql('themes', :backlog_id => target_backlog.id,
       :name => theme_data.name, :code => theme_data.code, :position => position,
       :created_at => target_backlog.created_at, :updated_at => target_backlog.updated_at)

      # build stories
      creator = StoryCreator.new
      arr(theme_data, :stories).each_with_index do |story, index|
        sql << creator.create_sql(story, index+1, target_backlog)
      end

      sql
    end

    private
      def set_theme_properties(theme, target_backlog)
        @theme.name = theme.name
        @theme.code = theme.code
        @theme.created_at = target_backlog.created_at
        @theme.updated_at = target_backlog.updated_at
        @theme.save!
      end
  end
end