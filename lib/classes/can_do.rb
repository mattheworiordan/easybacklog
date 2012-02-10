# CanDo module that is included into models to add can? and authorize! methods
#
# Activate in a model as follows:
# can_do :privileges => [privileges_model], (optional :inherited_privilege => [inherited_privilege_model_with_can_do (parent  )])
#
class << ActiveRecord::Base
  def can_do(options = {})
    include InstanceMethods

    cattr_accessor :privileges, :inherited_privilege

    if options.has_key?(:privileges)
      self.privileges = options[:privileges]
    else
      self.privileges = nil
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
        if self.class.privileges.present?
          privileges_model = send self.class.privileges
          explicit_user = privileges_model.where(:user_id => current_user.id)
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
          inherited_privilege_model = if self.class.inherited_privilege.kind_of?(Symbol)
            self.class.inherited_privilege
          else
            # an array of symbols has been passed in, use the first match
            self.class.inherited_privilege.detect { |sym| self.send(sym).respond_to?(:can?) }
          end

          inherited_privilege_model = self.send inherited_privilege_model
          inherited_privilege_model.can? action, current_user
        end
      end
  end
end

module CanDo
  class AuthenticationError < StandardError; end
end