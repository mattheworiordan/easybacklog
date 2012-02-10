class Privilege
  PRIVILEGES = %w(none read readstatus full)
  DESCRIPTIONS = {
    :none => 'No access',
    :read => 'Read only access',
    :readstatus => 'Read only and status update access',
    :full => 'Full access'
  }

  attr_reader :code

  class << self
    def all
      PRIVILEGES.map { |p| new(p) }
    end

    def find(code)
      code = code.to_s if code.kind_of?(Symbol)
      all.detect { |l| l.code.downcase == code } || raise(ActiveRecord::RecordNotFound)
    end

    def highest
      all.last
    end

    def none
      all.first
    end
  end

  def initialize(code)
    @code = PRIVILEGES.detect { |l| l == code.to_s } || PRIVILEGES.first
  end

  def to_param
    @code
  end
  alias_method :to_s, :to_param

  def ==(object)
    if object.respond_to? :code
      object.code == code
    else
      # probably a string or symbol
      object.to_s == @code
    end
  end

  # return the highest of the current privilege and privilege passed in
  def highest(other_privilege)
    # get the privilege object if string passed in
    other_privilege = self.class.find(other_privilege) unless other_privilege.respond_to?(:code)
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

  def description
    DESCRIPTIONS[code.to_sym]
  end
end