# Module outputs statistics on backlogs & themes with every request where scores have changed 
#  and appends this output to the model with attribute statistics
#  so that JavaScript client-side does not need to make a second request

module ScoreStatistics
  def self.included(base)
    base.send :before_save, :check_if_score_has_changed
  end

  # returns score stats for backlog & child themes if relevant model fields have changed
  #   option :force => true to force return of stats even if nothing in model has changed
  def score_statistics(options = {})
    if options.include?(:force) || (@score_changed && !@score_changed.empty?)
      backlog = case
        when self.kind_of?(Backlog) then self
        when self.kind_of?(Theme) then self.backlog
        when self.kind_of?(Story) then self.theme.backlog
        else raise "Statistics module does not support this model type"
      end

      themes = backlog.themes.map do |theme|
        {
          :theme_id => theme.id,
          :points => theme.points,
          :cost_formatted => theme.cost_formatted,
          :days => theme.days
        }
      end

      {
          :points => backlog.points,
          :cost_formatted => backlog.cost_formatted,
          :days => backlog.days,
          :themes => themes
      }
    end
  end

  private
    def check_if_score_has_changed
      @score_changed = ['score_90', 'score_50','rate','velocity'] & self.changes.keys unless self.changes.empty? # ignore empty before_save
    end
end