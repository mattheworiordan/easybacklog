class ApiController < ActionController::Base
  layout 'api'

  before_filter :prevent_default_js

  private
    def prevent_default_js
      @dont_render_application_js = true
    end
end