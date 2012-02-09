class AccountUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :account
  validates_presence_of :user_id, :account_id
  validates_inclusion_of :admin, :in => [true, false]

  include PrivilegeProperty

  def upgrade_privilege(new_privilege)
    highest = privilege.highest(new_privilege)
    update_attributes! :privilege => highest.privilege
  end
end