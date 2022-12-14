class Theme < ActiveRecord::Base
  include ActiveRecordExceptions
  include ScoreStatistics
  include Lockable

  acts_as_list :scope => :backlog

  belongs_to :backlog, :inverse_of => :themes
  validates_presence_of :backlog

  has_many :stories, :dependent => :destroy, :order => 'position', :inverse_of => :theme

  validates_uniqueness_of :name, :scope => [:backlog_id]
  validates_presence_of :name
  validates_uniqueness_of :code, :scope => [:backlog_id]
  validates_format_of :code, :with => /^[A-Z0-9a-z]{3}$/, :message => 'must be 3 alphanumeric characters', :unless => Proc.new { |user| user.code.blank? }

  before_save :assign_code_if_blank

  attr_accessible :name, :code, :position

  can_do :inherited_privilege => :backlog

  def editable?
    backlog.editable?
  end

  def destroyable?
    editable? || backlog.destroyable?
  end

  def points
    ScoreCalculator.total_points stories
  end

  def days
    points / backlog.velocity if backlog.days_estimatable?
  end

  def cost
    days * backlog.rate if backlog.cost_estimatable?
  end

  def cost_formatted
    (cost || 0).to_currency(:precision => 0, :locale => backlog.locale.code.to_s)
  end

  def days_formatted
    format('%0.1f', days)
  end

  def re_number_stories
    ActiveRecord::Base.transaction do
      raise StoriesCannotBeRenumbered unless stories.select { |s| s.accepted? }.blank?

      # if stories have unique id greater than 10,000,000 simply make space for up to 10,000 stories
      stories.where('unique_id >= ?', (1000 * 1000 * 10)).each do |story|
        story.unique_id = story.unique_id + 10000
        story.save!
      end
      # now renumber in the range 10,000,000 - 10,010,000 so that next number does not create unique validation problems
      stories.each_with_index do |story, index|
        story.unique_id = index + (1000 * 1000 * 10)
        story.save!
      end
      # renumber starting at 1
      stories.each_with_index do |story, index|
        story.unique_id = index+1
        story.save!
      end
    end
  end

  def add_existing_story(story)
    # don't allow a story to be moved to another backlog for security reasons
    raise StoryCannotBeMoved if story.theme.backlog != backlog
    story.theme_id = id
    # don't change the unique ID unless there is a conflict
    story.unique_id = nil unless stories.where(:unique_id => story.unique_id).blank?
    story.save!
  end

  def move_to_backlog(new_backlog)
    # you can't move a theme if any of the stories are assigned to sprints
    raise ThemeCannotBeMoved, 'One or more stories in this theme are assigned to sprints.' if stories.select { |story| story.sprint_story.present? }.present?
    raise ThemeCannotBeMoved, 'The target backlog is the current backlog.' if new_backlog == backlog
    raise ThemeCannotBeMoved, 'The target backlog is locked and not editable.' if new_backlog.locked?
    raise ThemeCannotBeMoved, 'This backlog is locked and not editable.' if backlog.locked?
    self.backlog = new_backlog
    self.code = nil if new_backlog.themes.where(:code => code).present? # just create a new code if that one already exists
    # ensure name is unique by adding a number to the end
    name_suffix = nil
    while new_backlog.themes.where(:name => "#{name}#{name_suffix ? " #{name_suffix}" : ''}").present?
      name_suffix = 0 if name_suffix.blank?
      name_suffix += 1
    end
    self.name = "#{name}#{name_suffix ? " #{name_suffix}" : ''}"
    self.position = nil
    save!
  end

  private
    def assign_code_if_blank
      if code.blank?
        # take 1st letter of each alphanumeric word to make up 3 chars
        # if less than 3 words, take more letters from words
        # take from latter words if first word is single letter
        words = name.gsub(/[^a-z0-9 ]/i,' ').strip.split(/[ ]+/).compact
        self.code = case [words.length, 3].min
          when 3 then words[0].first + words[1].first + words[2].first
          when 2 then words[0].first(2) + words[1].first(words[0].length > 1 ? 1 : 2)
          when 1 then words[0].first(3)
        end
        self.code = "#{self.code}01" if self.code.length == 1
        self.code = "#{self.code}1" if self.code.length == 2
      end

      taken_codes = (if new_record?
        backlog.themes
      else
        backlog.themes.where('id <> ?', self.id)
      end).map(&:code).sort

      self.code = code.upcase

      if taken_codes.include?(code)
        potential_codes = []
        potential_codes.concat (1..9).map { |index| "#{code.first(2)}#{index}" }
        potential_codes.concat (10..99).map { |index| "#{code.first(1)}#{index}" }
        potential_codes.concat (100..999).map { |index| "#{index}" }
        available_codes = potential_codes - taken_codes
        raise "No more codes available" if available_codes.blank?
        self.code = available_codes.first
      end
    end
end