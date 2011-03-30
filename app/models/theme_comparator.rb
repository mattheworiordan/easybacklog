# Represents comparison of two themes
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
class ThemeComparator
  include Comparator

  @stories = nil

  def stories
    # not yet processed so arrange them now
    if @stories == nil then
      @stories = []
      base_stories = @base.blank? ? [] : @base.stories.map(&:unique_id)
      target_stories = @target.blank? ? [] : @target.stories.map(&:unique_id)
      # iterate through base stories and add equivalent target stories if they exist
      base_stories.each do |unique_id|
        matching_target = @target.blank? ? [] : @target.stories.where(:unique_id => unique_id)
        @stories << StoryComparator.new(@base.stories.find_by_unique_id(unique_id), (matching_target.empty? ? nil : matching_target.first) )
        target_stories.delete(matching_target.first.unique_id) unless matching_target.empty?
      end
      # target has some unmatched stories, lets add these
      target_stories.each do |unique_id|
        @stories << StoryComparator.new(nil, @target.stories.find_by_unique_id(unique_id))
      end
    end
    @stories
  end

  def identical?
    !name_changed? && !code_changed?
  end
end