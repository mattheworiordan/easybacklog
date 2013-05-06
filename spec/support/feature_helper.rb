module FeatureHelper
  def self.included(base)
    base.class_eval do
      self.use_transactional_fixtures = false
    end
  end
end