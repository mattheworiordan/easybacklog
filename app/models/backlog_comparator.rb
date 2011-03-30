# Represents comparison of two backlogs
#
# Base is typically the older version
# Target is typically the newer version so you can see if any values have been added, deleted or change from base
#
# Methods include:
# * base
# * target
# * [attribute]_changed?
# * [attribute]_increased?
# * [attribute]_decreased?
class BacklogComparator
  include Comparator

  @themes = nil

  def themes
    # not yet processed so arrange them now
    if @themes == nil then
      @themes = []
      base_themes = @base.themes.map(&:code)
      target_themes = @target.themes.map(&:code)
      # iterate through base themes and add equivalent target themes if they exist
      base_themes.each do |code|
        matching_target = @target.themes.where(:code => code)
        @themes << ThemeComparator.new(@base.themes.find_by_code(code), (matching_target.empty? ? nil : matching_target.first) )
        target_themes.delete(matching_target.first.code) unless matching_target.empty?
      end
      # target has some unmatched themes, lets add these
      target_themes.each do |code|
        @themes << ThemeComparator.new(nil, @target.themes.find_by_code(code))
      end
    end
    @themes
  end

  def identical?
    !rate_changed? && !velocity_changed?
  end
end