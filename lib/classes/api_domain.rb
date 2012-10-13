# API domain matcher, returns true if request looks like it is for an API domain
class ApiDomain
  def self.matches?(request)
    request.path.match(/^\/api/) ||
    request.headers['X-Forward-To-API'] == 'true' # used by testing framework to emulate this scope
  end
end