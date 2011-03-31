# Represents comparison of two stories
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
class StoryComparator
  include Comparator

  @criteria = nil

  def acceptance_criteria
    # not yet processed so arrange them now
    if @criteria == nil then
      @criteria = []
      base_criteria = @base.blank? ? [] : @base.acceptance_criteria.map(&:criterion)
      # build up a list of target criteria based on criterion text (the key)
      # note that we could have two criterion with the same key, so keep in an array
      # and delete each time a match is found
      target_criteria = @target.blank? ? [] : @target.acceptance_criteria.map(&:criterion)
      target_criteria_objects = @target.blank? ? [] : @target.acceptance_criteria.map { |a| a } # create a simple array of objects

      # iterate through base criteria and add equivalent target criteria if they exist
      base_criteria.each do |criterion|
        matching_target_index = target_criteria.index(criterion)
        matching_target = matching_target_index.blank? ? nil : target_criteria_objects[matching_target_index]
        base_criterion = @base.acceptance_criteria.select { |crit_object| crit_object.criterion == criterion }
        @criteria << AcceptanceCriterionComparator.new(base_criterion.first, matching_target)
        unless matching_target_index.blank?
          # delete the key :criterion and the object criterion from the arrays so they can't be assocated to base again
          target_criteria.delete_at(matching_target_index)
          target_criteria_objects.delete_at(matching_target_index)
        end
      end
      # target has some unmatched criteria, lets add these
      target_criteria.each_with_index do |criterion, i|
        @criteria << AcceptanceCriterionComparator.new(nil, target_criteria_objects[i])
      end
    end
    @criteria
  end

  # checks all db values are identical, does not compare derived values such as cost which may vary based on the backlog rate
  def identical?
    !as_a_changed? && !i_want_to_changed? && !so_i_can_changed? && !comments_changed? && !score_50_changed? && !score_90_changed?
  end
end