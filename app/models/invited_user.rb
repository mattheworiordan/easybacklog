class InvitedUser < ActiveRecord::Base
  belongs_to :invitee_user, :class_name => 'User'
  belongs_to :account

  attr_accessible :email, :invitee_user_id, :privilege

  validates_presence_of :email, :invitee_user_id

  before_save :assign_security_code

  include PrivilegeProperty

  private
    def assign_security_code
      if (self.security_code.blank?)
        self.security_code = (1..10).map { |i| (rand(26) + 97).chr }.join
      end
    end
end
