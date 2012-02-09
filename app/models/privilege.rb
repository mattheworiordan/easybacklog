class Privilege
  PRIVILEGES = %w(none read readstatus full)
  attr_reader :privilege

  class << self
    def all
      PRIVILEGES.map { |p| new(p) }
    end

    def find(param)
      param = param.to_s if param.kind_of?(Symbol)
      all.detect { |l| l.to_param.downcase == param } || raise(ActiveRecord::RecordNotFound)
    end

    def highest
      all.last
    end

    def none
      all.first
    end
  end

  def initialize(privilege)
    @privilege = PRIVILEGES.detect { |l| l == privilege.to_s } || PRIVILEGES.first
  end

  def to_param
    @privilege
  end
  alias_method :to_s, :to_param

  def ==(object)
    if object.respond_to? :privilege
      object.privilege == privilege
    else
      # probably a string
      object.to_s == @privilege
    end
  end

  # return the highest of the current privilege and privilege passed in
  def highest(other_privilege)
    # get the privilege object if string passed in
    other_privilege = self.class.find(other_privilege) unless other_privilege.respond_to?(:privilege)
    all_privileges = self.class.all
    if all_privileges.index(other_privilege) > all_privileges.index(self)
      other_privilege
    else
      self
    end
  end

  # assume privileges are linear, so if you ask can?(readstatus) for full privilege answer is true
  def can?(check_privilege)
    highest(check_privilege) == self
  end
end