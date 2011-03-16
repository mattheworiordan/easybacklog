class Theme < ActiveRecord::Base
  acts_as_list

  belongs_to :backlog
  validates_presence_of :backlog

  has_many :stories, :dependent => :delete_all, :order => 'position'

  validates_uniqueness_of :name, :scope => [:backlog_id]
  validates_presence_of :name
  validates_uniqueness_of :code, :scope => [:backlog_id]
  validates_format_of :code, :with => /^[A-Z0-9a-z]{3}$/, :message => 'must be 3 alphanumeric characters', :unless => Proc.new { |user| user.code.blank? }

  before_save :assign_code_if_blank

  attr_accessible :name, :code, :position

  include ScoreStatistics

  def points
    total_score_diff = stories.inject(0) { |val, story| val + story.score_diff }
    total_lowest_score = stories.inject(0) { |val, story| val + story.lowest_score }
    Math.sqrt(total_score_diff) + total_lowest_score
  end

  def days
    points / backlog.velocity
  end

  def cost
    days * backlog.rate
  end

  def cost_formatted
    (cost || 0).to_currency(:precision => 0, :locale => backlog.company.locale.code.to_s)
  end

  private
    def assign_code_if_blank
      if code.blank?
        # take 1st letter of each word to make up 3 chars
        # if less than 3 words, take more letters from words
        # take from latter words if first word is single letter
        words = name.split(/[ _-]/)
        self.code = case words.length
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