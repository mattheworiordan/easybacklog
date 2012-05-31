class ApiController < ActionController::Base
  layout 'api'

  before_filter :prevent_default_js

  caches_action :index, :expires_in => 300, :cache_path => Proc.new { |c| "#{root_path}:#{request.ssl?}" } # cache for 5 minutes, vary cache by SSL or Plain

  private
    def prevent_default_js
      @dont_render_application_js = true
    end
end