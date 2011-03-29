class Backlog < ActiveRecord::Base
  belongs_to :company
  belongs_to :author, :class_name => 'User'
  belongs_to :last_modified_user, :class_name => 'User'

  has_many :themes, :dependent => :delete_all, :order => 'position'

  # self references for snapshots
  has_many :snapshots, :class_name => 'Backlog', :foreign_key => 'snapshot_master_id', :order => 'created_at desc'
  belongs_to :snapshot_master, :class_name => 'Backlog'

  validates_uniqueness_of :name, :scope => [:company_id], :message => 'has already been taken for another backlog'
  validates_presence_of :name, :rate, :velocity
  validates_numericality_of :rate, :velocity

  attr_accessible :company, :name, :rate, :velocity

  before_save :check_can_modify

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

  # snapshot is a non-editable copy of a backlog in time
  def create_snapshot(snapshot_name)
    new_backlog = company.backlogs.new(self.attributes.merge({ :name => snapshot_name, :created_at => Time.now, :updated_at => Time.now }))
    # these 2 attributes are protected
    new_backlog.author = self.author
    new_backlog.last_modified_user = self.last_modified_user
    new_backlog.save!

    # copy the children
    self.copy_children_to_backlog new_backlog

    # now lock the record and assign the snapshot master to self
    new_backlog.snapshot_master = self
    new_backlog.save!

    new_backlog
  end

  # editable if this not a snapshot i.e. a snapshot master exists
  def editable?
    self.snapshot_master.blank?
  end

  def update_meta_data(user)
    self.updated_at = Time.now
    self.last_modified_user = user
    self.save!
  end

  private
    # only allow save on working copy i.e. not snapshot
    #  but do allow editing if snapshot_master has changed as we need to allow this to be set
    def check_can_modify
      self.snapshot_master_id_changed? || self.snapshot_master.blank?
    end
end