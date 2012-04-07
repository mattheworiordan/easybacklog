class BacklogUserSetting < ActiveRecord::Base
  belongs_to :user
  belongs_to :backlog
  validates_presence_of :user_id, :backlog_id

  attr_accessible :filter, :collapsed_themes
end