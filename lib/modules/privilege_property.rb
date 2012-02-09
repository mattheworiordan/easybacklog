module PrivilegeProperty
  def privilege
    begin
      Privilege.find(read_attribute(:privilege))
    rescue ActiveRecord::RecordNotFound
      Privilege.none
    end
  end

  def privilege=(new_privilege)
    write_attribute :privilege, new_privilege.respond_to?(:privilege) ? new_privilege.privilege : new_privilege
  end
end