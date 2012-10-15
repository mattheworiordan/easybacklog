class BacklogUserSetting < ActiveRecord::Base
  belongs_to :user, :inverse_of => :backlog_user_settings
  belongs_to :backlog, :inverse_of => :backlog_user_settings
  validates_presence_of :user_id, :backlog_id

  attr_accessible :filter, :collapsed_themes
end