class User < ActiveRecord::Base
  has_many :company_users
  has_many :companies, :through => :company_users

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  attr_accessible :name, :company, :email, :password, :password_confirmation, :remember_me

  validates_presence_of :name
end
