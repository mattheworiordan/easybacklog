# API domain matcher, returns true if request looks like it is for an API domain
class ApiDomain
  def self.matches?(request)
    (request.subdomain.present? && request.subdomain == 'api') ||
      request.host =~ /^api\-easybacklog\-\w+\.heroku(?:|app).com$/ ||
      ['api-local','api-easybacklog.dev'].include?(request.domain)  ||
      request.headers['X-Forward-To-API'] == 'true'
  end
end