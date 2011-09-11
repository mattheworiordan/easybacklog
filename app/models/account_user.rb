class AccountUser < ActiveRecord::Base
  belongs_to :user
  belongs_to :account
  validates_presence_of :user_id, :account_id
  validates_inclusion_of :admin, :in => [true, false]
end