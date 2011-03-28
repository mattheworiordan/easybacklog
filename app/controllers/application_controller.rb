class ApplicationController < ActionController::Base
  protect_from_forgery
  after_filter :log_last_page_viewed

  # Devise hook
  def after_sign_in_path_for(resource_or_scope)
    if resource_or_scope.is_a?(User)
      if session[:after_register_redirect_to].blank?
        companies_path
      else
        # redirect after register/sign in path was set, used by invite process where someone registers
        #  and effectively signs in, so we need to redirect them back to the invite page
        path = session[:after_register_redirect_to]
        session[:after_register_redirect_to] = nil
        path
      end
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
  def current_company
    @current_company
  end
  helper_method :current_company

  # list of all companies a user has access to
  def companies
    if user_signed_in?
      current_user.companies
    end
  end
  helper_method :companies

  def is_company_admin?
    @current_company && user_signed_in? && !@current_company.company_users.where(:user_id => current_user.id, :admin => true).empty?
  end
  helper_method :is_company_admin?

  private
    def log_last_page_viewed
      session[:last_url] = request.path
    end
end
