# API domain matcher, returns true if request looks like it is for an API domain
class ApiDomain
  def self.matches?(request)
    (request.subdomain.present? && request.subdomain != "api") || request.domain =~ /^api\-easybacklog\-\w+\.heroku(?:|app).com$/ || request.domain == 'api-local' || request.headers['X-Forward-To-API'] == 'true'
  end
end