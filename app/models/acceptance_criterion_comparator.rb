# Represents comparison of two acceptance criterion
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
class AcceptanceCriterionComparator
  include Comparator

  def identical?
    !criterion_changed?
  end
end