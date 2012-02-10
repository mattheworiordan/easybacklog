class CompanyUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :company
  validates_presence_of :user_id, :company_id

  include PrivilegeProperty

  def admin?
    company.account.account_users.find_by_user_id(user_id).admin?
  end
end