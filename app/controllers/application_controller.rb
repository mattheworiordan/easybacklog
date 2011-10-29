class ApplicationController < ActionController::Base
  protect_from_forgery
  include SslRequired

  after_filter :log_last_page_viewed
  before_filter :test_env_mail_config if Rails.env.test? # set up ActionMailer host when running Cuke so links work

  # Devise hook
  def after_sign_in_path_for(resource_or_scope)
    if resource_or_scope.is_a?(User)
      if session[:after_register_redirect_to].blank?
        if current_account
          account_path current_account
        else
          if accounts.length > 0
            root_path
          else
            accounts_path
          end
        end
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

  # if instance variable for account is set then return it
  def current_account
    if @current_account.blank? && (accounts.count == 1)
      # if user only has access to one account then treat user as logged in with that account
      accounts.first
    else
      @current_account
    end
  end
  helper_method :current_account

  # list of all accounts a user has access to
  def accounts
    if user_signed_in?
      current_user.accounts
    end
  end
  helper_method :accounts

  def is_account_admin?
    @current_account && user_signed_in? && !@current_account.account_users.where(:user_id => current_user.id, :admin => true).empty?
  end
  helper_method :is_account_admin?

  def is_admin?
    user_signed_in? && current_user.admin_rights?
  end

  private
    def log_last_page_viewed
      session[:last_url] = request.path
    end

    def set_download_headers(filename)
      headers["Content-Disposition"] = "attachment; filename=\"#{filename}\""
      if request.env['HTTP_USER_AGENT'] =~ /msie/i
        headers['Pragma'] = 'public'
        headers['Cache-Control'] = 'no-cache, must-revalidate, post-check=0, pre-check=0'
        headers['Expires'] = "0"
      end
    end

    def test_env_mail_config
      ActionMailer::Base.default_url_options[:host] = request.host_with_port
    end
end
