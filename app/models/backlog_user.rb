class BacklogUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :backlog
  validates_presence_of :user_id, :backlog_id

  include PrivilegeProperty

  def admin?
    backlog.account.account_users.find_by_user_id(user_id).admin?
  end
end