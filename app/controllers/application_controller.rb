class ApplicationController < ActionController::Base
  protect_from_forgery

  # Devise hook
  def after_sign_in_path_for(resource_or_scope)
    if resource_or_scope.is_a?(User)
      companies_path
    else
      super
    end
  end
end
