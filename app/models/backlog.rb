class Backlog < ActiveRecord::Base
  belongs_to :company
  belongs_to :author, :class_name => 'User'
  belongs_to :last_modified_user, :class_name => 'User'

  has_many :themes, :dependent => :delete_all, :order => 'position'

  validates_uniqueness_of :name, :scope => [:company_id], :message => 'has already been taken for another backlog'
  validates_presence_of :name, :rate, :velocity
  validates_numericality_of :rate, :velocity

  attr_accessible :company, :name, :rate, :velocity

  include ScoreStatistics

  def days
    themes.inject(0) { |val, theme| val + theme.days }
  end

  def points
    themes.inject(0) { |val, theme| val + theme.points }
  end

  def cost
    themes.inject(0) { |val, theme| val + theme.cost }
  end

  def cost_formatted
    (cost || 0).to_currency(:precision => 0, :locale => company.locale.code.to_s)
  end

  def rate_formatted
    (rate || 0).to_currency(:precision => 0, :locale => company.locale.code.to_s)
  end

  def days_formatted
    format('%0.1f', days)
  end

  # simply copy all themes, stories and acceptance criteria to destination backlog
  def copy_children_to_backlog(destination)
    self.themes.each do |theme|
      new_theme = theme.clone
      destination.themes << new_theme
      theme.stories.each do |story|
        new_story = story.clone
        new_theme.stories << new_story
        story.acceptance_criteria.each do |criterion|
          new_story.acceptance_criteria << criterion.clone
        end
      end
    end
  end

  def update_meta_data(user)
    self.updated_at = Time.now
    self.last_modified_user = user
    self.save!
  end
end