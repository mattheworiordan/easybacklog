module PrivilegesHelper
  # provide the privilege options
  # explicit_privilege is passed in when account_user is inherited privilege and explicit_privilege is the privilege for the current context such as company
  # context is company/backlog etc
  def privilege_options(account_user, explicit_privilege = nil, context = 'all')
    html = ''
    user_privilege = account_user.privilege.code

    unless explicit_privilege.nil?
      if explicit_privilege.has_key?(account_user.user_id)
        prevent_inherited_selection = true
        user_privilege = explicit_privilege[account_user.user_id].privilege.code
      else
        # user has not got an explicit privilege so ensure the explicit options are not selected
        user_privilege = nil
      end
      html = content_tag(:optgroup, inherited_option(account_user.privilege, prevent_inherited_selection), :label => 'Inherited permission')
    end

    explicit_options = Privilege.all.map do |priv|
      content_tag(:option, "#{priv.description} to #{context}", privilege_options_attributes(priv.to_s, user_privilege))
    end.join('')

    if explicit_privilege.nil?
      html += explicit_options
    else
      html += content_tag(:optgroup, raw(explicit_options), :label => "Explicit permissions for #{context}")
    end

    html
  end

  private
    def privilege_options_attributes(id, privilege, prevent_selected = false)
      ret = {
        :value => id
      }
      ret[:selected] = 'true' if !prevent_selected && (privilege == id)
      ret
    end

    # returns the option for the inherited privilege
    def inherited_option(privilege, prevent_selected)
      privilege_text = "#{privilege.description} (inherited)"
      content_tag(:option, privilege_text, privilege_options_attributes(privilege.code, privilege.code, prevent_selected).merge(:value => '(inherited)'))
    end
end