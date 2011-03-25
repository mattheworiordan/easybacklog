class ApplicationController < ActionController::Base
  protect_from_forgery
  after_filter :log_last_page_viewed

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

  # if instance variable for company is set then return it
  def company
    @company
  end
  helper_method :company

  # list of all companies a user has access to
  def companies
    if user_signed_in?
      current_user.companies
    end
  end
  helper_method :companies

  private
    def log_last_page_viewed
      session[:last_url] = request.path
    end
end
