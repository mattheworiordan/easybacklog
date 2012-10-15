class User < ActiveRecord::Base
  has_many :account_users, :dependent => :destroy, :inverse_of => :user
  has_many :company_users, :dependent => :destroy, :inverse_of => :user
  has_many :backlog_users, :dependent => :destroy, :inverse_of => :user
  has_many :backlog_user_settings, :dependent => :destroy, :inverse_of => :user
  has_many :companys, :through => :company_user
  has_many :accounts, :through => :account_users
  has_many :backlogs, :through => :backlog_users
  has_many :user_tokens, :dependent => :destroy, :inverse_of => :user
  has_many :invited_users, :inverse_of => :invitee_user

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  attr_accessible :name, :email, :password, :password_confirmation, :remember_me

  validates_presence_of :name
end
