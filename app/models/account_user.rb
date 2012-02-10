class AccountUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :account
  validates_presence_of :user_id, :account_id
  validates_inclusion_of :admin, :in => [true, false]

  # if user is deleted from account, then delete all their specific privileges for backlogs or companies
  has_many :backlog_users, :foreign_key => 'user_id', :primary_key => 'user_id', :dependent => :destroy
  has_many :company_users, :foreign_key => 'user_id', :primary_key => 'user_id', :dependent => :destroy

  include PrivilegeProperty

  def upgrade_privilege(new_privilege)
    highest = privilege.highest(new_privilege)
    update_attributes! :privilege => highest.code
  end
end