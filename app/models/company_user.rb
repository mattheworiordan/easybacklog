class CompanyUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :company
  validates_presence_of :user_id, :company_id

  include PrivilegeProperty
end