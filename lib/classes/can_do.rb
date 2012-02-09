# CanDo module that is included into models to add can? and authorize! methods
#
# Activate in a model as follows:
# can_do :user_privileges => [user_privileges_model], (optional :inherited_privilege => [inherited_privilege_model_with_can_do (parent  )])
#
class << ActiveRecord::Base
  def can_do(options = {})
    include InstanceMethods

    cattr_accessor :user_privileges, :inherited_privilege

    if options.has_key?(:user_privileges)
      self.user_privileges = options[:user_privileges]
    else
      self.user_privileges = nil
    end

    if options.has_key?(:inherited_privilege)
      self.inherited_privilege = options[:inherited_privilege]
    else
      self.inherited_privilege = nil
    end
  end

  module InstanceMethods
    # returns true if user can perform an action on the current model
    def can?(action, current_user)
      if current_user.blank?
        false
      else
        if self.class.user_privileges.present?
          user_privileges_model = send self.class.user_privileges
          explicit_user = user_privileges_model.where(:user_id => current_user.id)
          if explicit_user.present? && explicit_user.first.admin?
            true
          elsif explicit_user.present? && explicit_user.first.privilege.present? # no privilege or nil privilege indicates inheritance
            # explicit permissions have been set for this user
            explicit_user.first.privilege.can? action
          else
            can_inherited_privilege? action, current_user
          end
        else
          can_inherited_privilege? action, current_user
        end
      end
    end

    def cannot?(action, current_user)
      !can? action, current_user
    end

    # raise an exception of user does not have permission
    def authorize!(action, current_user)
      raise CanDo::AuthenticationError.new('You do not have the necessary permissions to perform this action') unless can?(action, current_user)
    end

    private
      def can_inherited_privilege?(action, current_user)
        if self.class.inherited_privilege.present?
          inherited_privilege_model = self.send self.class.inherited_privilege
          inherited_privilege_model.can? action, current_user
        end
      end
  end
end

module CanDo
  class AuthenticationError < StandardError; end
end