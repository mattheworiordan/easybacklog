module Comparator
  def initialize(base, target)
    @base = base
    @target = target
  end

  def base
    @base
  end

  def target
    @target
  end

  # Adds the following methods:
  #   has_[attribute]_[verb]? or [attribute_verb]?
  #     verbs include: changed, increased, decreased
  # and deleted? or new? or changed?
  #
  # Examples:
  #   has_rate_changed?
  #   score_5_increased?
  #   deleted?
  def method_missing(method_sym, *arguments, &block)
    # if changed simply checks if attributes have changed in base / target
    attr_reg_ex = /^(?:has_)?([\w\d]+)_(changed|increased|decreased)\?$/
    no_match_reg_ex = /^(?:has_)?(deleted|new|changed)\?$/

    # entire object methods
    if method_sym.to_s =~ no_match_reg_ex
      method = no_match_reg_ex.match(method_sym.to_s)[1]
      case method
      when 'deleted' then
        @target.blank?
      when 'new' then
        @base.blank?
      when 'changed' then
        # just relay to identical? method defined in comparator classes
        !identical?
      end
    # attribute methods
    elsif method_sym.to_s =~ attr_reg_ex
      attribute, method = attr_reg_ex.match(method_sym.to_s)[1..2]
      case method
      when 'changed' then
        if @base.blank? || @target.blank?
          true
        else
          @base.send(attribute.to_sym) != @target.send(attribute.to_sym)
        end
      when 'increased' then
        if @base.blank? || @target.blank?
          nil
        else
          base = "#{@base.send(attribute.to_sym)}".gsub(/[^0-9\.]/, '')
          target = "#{@target.send(attribute.to_sym)}".gsub(/[^0-9\.]/, '')
          base = 0 unless (base =~ /\d+/)
          target = 0 unless (base =~ /\d+/)
          target.to_f > base.to_f
        end
      when 'decreased' then
        if @base.blank? || @target.blank?
          nil
        else
          base = "#{@base.send(attribute.to_sym)}".gsub(/[^0-9\.]/, '')
          target = "#{@target.send(attribute.to_sym)}".gsub(/[^0-9\.]/, '')
          base = 0 unless (base =~ /\d+/)
          target = 0 unless (base =~ /\d+/)
          target.to_f < base.to_f
        end
      end
    else
      # no method match
      super
    end
  end
end