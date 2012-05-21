class PrimaryDomain
  def self.matches?(request)
    !ApiDomain.matches? request
  end
end