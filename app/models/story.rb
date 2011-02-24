class Story < ActiveRecord::Base
  acts_as_list

  belongs_to :theme
  has_many :acceptance_criteria, :dependent => :delete_all, :order => 'position'
  validates_presence_of :theme
  validates_uniqueness_of :unique_id, :scope => [:theme_id]

  before_save :assign_unique_id

  private
    def assign_unique_id
      unless theme.blank? # creation of this record will fail anyway as it needs a theme, no point continuing
        if unique_id.blank?
          taken_ids = (if (new_record?)
            theme.stories
          else
            theme.stories.where('id <> ?', this.id)
          end).order('unique_id').map { |story| story.unique_id }

          self.unique_id = if taken_ids.empty?
            1
          elsif taken_ids.count == taken_ids.last
            taken_ids.last + 1
          else
            ( (1..taken_ids.count).to_a - taken_ids ).first
          end
        end
      end
    end
end