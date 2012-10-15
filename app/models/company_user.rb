class CompanyUser < ActiveRecord::Base
  belongs_to :user, :inverse_of => :company_users
  belongs_to :company, :inverse_of => :company_users
  validates_presence_of :user_id, :company_id

  include PrivilegeProperty

  def admin?
    company.account.account_users.find_by_user_id(user_id).admin?
  end
end