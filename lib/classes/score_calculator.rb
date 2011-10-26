class ScoreCalculator
  def self.total_points(stories)
    total_score_diff = stories.inject(0) { |val, story| val + story.score_diff ** 2 }
    total_lowest_score = stories.inject(0) { |val, story| val + story.lowest_score }
    Math.sqrt(total_score_diff) + total_lowest_score
  end
end