class ApplicationController < ActionController::Base
  protect_from_forgery
  include SslRequired

  after_filter :log_last_page_viewed
  before_filter :test_env_mail_config if Rails.env.test? # set up ActionMailer host when running Cuke so links work
  before_filter :ensure_last_sign_in_updated # last sign in date is not updated if user is automatically logged in
  before_filter :set_default_locale

  # Devise hook
  def after_sign_in_path_for(resource_or_scope)
    if session[:after_register_redirect_to].blank?
      stored_location_for(resource_or_scope) || logged_in_user_home_path
    else
      # redirect after register/sign in path was set, used by invite process where someone registers
      #  and effectively signs in, so we need to redirect them back to the invite page
      path = session[:after_register_redirect_to]
      session[:after_register_redirect_to] = nil
      path
    end
  end

  def logged_in_user_home_path
    if accounts.length == 0
      # let the accounts index page deal with a user without an account
      accounts_path
    elsif accounts.length == 1
      # show only the backlogs for this users only account
      account_path accounts.first
    else
      # show all accounts
      dashboard_path
    end
  end

  def send_json_error(error_message)
    render :status => 400, :json => { :status => 'error', :message => error_message }
  end

  def send_json_notice(notice_message, payload = {})
    render :json => { :status => 'notice', :message => notice_message }.merge(payload)
  end

  def send_xml_error(error_message)
    render :status => 400, :text => { :status => 'error', :message => error_message }.to_xml(:root => 'response')
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
      current_user.accounts.sort_by { |d| d.name.downcase }
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

    def ensure_admin
      unless is_admin?
        flash[:error] = 'You do not have permission to access the bunker'
        redirect_to root_path
      end
    end

    # last sign in date is not updated if user is automatically logged in
    # force login for the first impression of this session
    def ensure_last_sign_in_updated
      if user_signed_in?
        signed_in_at = Time.parse(cookies[:signed_in_at]) rescue Time.now - 2.hours
        if signed_in_at < Time.now - 1.hour
          sign_in(current_user, :force => true)
          cookies[:signed_in_at] = Time.now.utc
        end
      end
    end

    # because of issue with local persisting with the same instance http://labs.revelationglobal.com/2009/11/13/unicorn_and_i18n.html
    # we reset the locale to the default_locale for all requests and let this be overriden in other controllers
    def set_default_locale
      I18n.locale = I18n.default_locale
    end

    def filter_params_for(index = nil, *filter_fields)
      filter_fields = filter_fields.map { |d| d.to_s }
      params_group = index.blank? ? params : params[index]
      (params_group || {}).select { |key, value| !['action', 'controller', 'id'].include?(key) && !filter_fields.include?(key) }
    end

    def filter_params(*filter_fields)
      filter_params_for nil, *filter_fields
    end
end
