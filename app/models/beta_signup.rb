class BetaSignup < ActiveRecord::Base
  attr_accessible :email, :company

  validates_presence_of :email
  validates_format_of :email, :with => /^([^\s]+)((?:[-a-z0-9]\.)[a-z]{2,})$/i
  validates_uniqueness_of :unique_code, :email

  before_validation :assign_unique_code
  before_save :init
  before_save :assign_unique_code

  def log_click
    self.clicks = self.clicks + 1
    self.save!
  end

  private
    def assign_unique_code
      if (self.unique_code.blank? || self.class.where(:unique_code => self.unique_code).count > 0)
        # ensure we don't create a duplicate code
        begin
          self.unique_code = (1..6).map { |i| (rand(26) + 97).chr }.join
        end while self.class.where(:unique_code => self.unique_code).count > 0
      end
    end

    def init
      self.clicks ||= 0.0
    end
end
