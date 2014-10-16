module ToCurrencyExtension
  def to_currency(options = {})
    ActionView::Base.new.number_to_currency(self, options)
  end
end

class Fixnum
  include ToCurrencyExtension
end

class Float
  include ToCurrencyExtension
end

class BigDecimal
  include ToCurrencyExtension

  # Fixes decimals being encoded as strings, see http://stackoverflow.com/questions/6128794/rails-json-serialization-of-decimal-adds-quotes
  def as_json(options = nil) #:nodoc:
    if finite?
      self
    else
      NilClass::AS_JSON
    end
  end
end
