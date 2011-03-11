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

  def send_json_error(error_message)
    render :status => 400, :json => { :status => 'error', :message => error_message }
  end

  def send_json_notice(notice_message, payload = {})
    render :json => { :status => 'notice', :message => notice_message }.merge(payload)
  end
end
