class Locale < ActiveRecord::Base
  has_many :accounts, :inverse_of => :locale

  validates_presence_of :name, :code
end