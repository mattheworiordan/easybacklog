class User < ActiveRecord::Base
  has_many :account_users
  has_many :accounts, :through => :account_users

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  attr_accessible :name, :email, :password, :password_confirmation, :remember_me

  validates_presence_of :name
end
