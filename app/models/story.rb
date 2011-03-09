class Story < ActiveRecord::Base
  acts_as_list

  belongs_to :theme
  has_many :acceptance_criteria, :dependent => :delete_all, :order => 'position'
  validates_presence_of :theme
  validates_uniqueness_of :unique_id, :scope => [:theme_id], :message => 'ID has already been taken'
  validates_numericality_of :score_50, :score_90, :allow_nil => true
  validates_numericality_of :unique_id, :greater_than => 0, :allow_nil => true
  validates_format_of :score_50, :score_90, :with => /^(0|1|2|3|5|8|13|21)$/, :message => 'must be in the Fibonacci sequence and less than or equal to 21', :allow_nil => true
  validate :score_90_greater_than_50

  before_save :assign_unique_id

  attr_accessible :unique_id, :as_a, :i_want_to, :so_i_can, :comments, :score_50, :score_90

  def cost
    days * theme.backlog.rate
  end

  def cost_formatted
    (cost || 0).to_currency(:locale => theme.backlog.company.locale.code.to_s)
  end

  def points
    Math.sqrt(score_diff) + lowest_score
  end

  def days
    points / theme.backlog.velocity
  end

  def lowest_score
    (score_50 || score_90 || 0)
  end

  def score_diff
    if score_50.blank? || score_90.blank?
      0
    else
      (score_90 - score_50) ** 2
    end
  end

  private
    def score_90_greater_than_50
      unless score_50.blank? || score_90.blank?
        errors.add(:score_90, 'must be less than or equal to score 50') if score_90 < score_50
      end
    end

    def assign_unique_id
      unless theme.blank? # creation of this record will fail anyway as it needs a theme, no point
        if unique_id.blank?
          taken_ids = (if new_record?
            theme.stories
          else
            theme.stories.where('id <> ?', self.id)
          end).map(&:unique_id).sort

          self.unique_id = if taken_ids.empty?
            1
          else
            unique_id_gaps = (1..taken_ids.count).to_a - taken_ids
            if unique_id_gaps.empty?
               # all elements in sequence exist, go one higher than the highest element
              taken_ids.last + 1
            else
              # there is a gap, create a range of e.g. 1,2,3,4, remove taken ids and use first item left
              unique_id_gaps.first
            end
          end
        end
      end
    end
end