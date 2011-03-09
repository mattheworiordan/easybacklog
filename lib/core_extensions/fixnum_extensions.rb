class Fixnum
  def to_currency(options = {})
    ActionView::Base.new.number_to_currency(self, options)
  end
end

class Float
  def to_currency(options = {})
    ActionView::Base.new.number_to_currency(self, options)
  end
end