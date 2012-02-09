module PrivilegesHelper
  def privilege_options(account_user)
    content_tag(:option, 'No access', privilege_options_attributes('none', account_user)) +
      content_tag(:option, 'Read only access to all', privilege_options_attributes('read', account_user)) +
      content_tag(:option, 'Read only and status update access to all', privilege_options_attributes('readstatus', account_user)) +
      content_tag(:option, 'Full access to all', privilege_options_attributes('full', account_user))
  end

  private
    def privilege_options_attributes(id, account_user)
      ret = {
        :value => id
      }
      ret[:selected] = 'true' if account_user.privilege.privilege == id
      ret
    end
end