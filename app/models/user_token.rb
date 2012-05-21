class UserToken < ActiveRecord::Base
  belongs_to :user
  attr_accessible
  validates_presence_of :access_token, :basic_authentication_token

  before_validation :generate_id
  before_save :prevent_change

  def generate_id
    self.access_token = rand(36**20).to_s(36) if access_token.blank?
    self.basic_authentication_token = Base64::encode64("#{user.id}:#{access_token}")
  end

  def prevent_change
    raise ActiveRecord::ReadOnlyRecord if !self.new_record? && self.changed?
  end
end
