class ApplicationController < ActionController::Base
  include HttpStatusCodes

  protect_from_forgery
  include SslRequired

  after_filter :log_last_page_viewed, :unless => :is_api?
  before_filter :test_env_mail_config if Rails.env.test? # set up ActionMailer host when running Cuke so links work
  before_filter :ensure_last_sign_in_updated # last sign in date is not updated if user is automatically logged in
  before_filter :set_default_locale
  before_filter :prepare_api_request, :if => :is_api?

  rescue_from ActiveRecord::RecordNotFound, :with => :render_not_found
  rescue_from ActiveModel::MassAssignmentSecurity::Error, :with => :render_unprocessable_entity
  rescue_from ActiveRecordExceptions::BacklogLocked, :with => :render_forbidden

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

  def send_json_error(error_message, status=STATUS_CODE[:bad_request])
    render :status => status, :json => { :status => 'error', :message => error_message }
  end

  def send_notice(notice_message, payload = {})
    render request.format.to_sym => { :status => 'notice', :message => notice_message }.merge(payload)
  end

  def send_xml_error(error_message, status=STATUS_CODE[:bad_request])
    render :status => status, :text => { :status => 'error', :message => error_message }.to_xml(:root => 'response')
  end

  def send_error(error_message, options={})
    http_status = options[:http_status].is_a?(Symbol) ? STATUS_CODE[options[:http_status]] : options[:http_status] # allow symbol or status to be passed in
    http_status = STATUS_CODE[:bad_request] if http_status.blank? # default to simple bad request 400
    flash_type = options[:flash] || :error
    error_message.gsub(/Please refresh your browser.?/i, '') if is_api? # don't show refresh browser messages if in the API

    respond_to do |format|
      format.json { send_json_error error_message, http_status }
      format.xml { send_xml_error error_message, http_status }

      format.all do
        # if we are redirecting to another page, simply add the error to the flash and redirect
        if options.has_key?(:redirect_to)
          flash[flash_type] = error_message
          redirect_to options[:redirect_to]
        elsif options.has_key?(:render_action)
          flash[flash_type] = error_message
          render :action => options[:render_action]
        else
          # if we have no specific action, then show a standard error page (last resort as bad UX)
          render :action => "#{http_status}_error", :controller => 'application', :status => http_status, :locals => { :error_message => error_message }, :formats => 'html'
        end
      end
    end
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

  def is_api?
    ApiDomain.matches?(request)
  end
  helper_method :is_api?

  # override current_user from Devise, use Devise if normal web request, use @current_api_user if using an API
  def current_user
    if is_api?
      @current_api_user
    else
      super
    end
  end

  def user_signed_in?
    if is_api?
      @current_api_user.present?
    else
      super
    end
  end

  def sign_in_api_user(user)
    @current_api_user = user
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

    # Same as filter_params below, however if an index is specified then params from that form object are used
    # i.e. params[:index] instead params is used
    def filter_params_for(index = nil, *filter_fields)
      filter_fields = filter_fields.map { |d| d.to_s }
      params_group = index.blank? ? params : params[index]
      # when iterating through the params, the keys are strings instead of symbols
      params_arr = (params_group || {}).keys.select { |key| !%w( action controller id format ).include?(key) && !filter_fields.include?(key) }.map { |key| [key.to_sym, params_group[key.to_sym]] }
      Hash[params_arr]
    end

    # remove any fields provided from the params object and return remaining fields
    # useful for filtering out unnecessary fields sent by Backbone which cause errors on mass update
    def filter_params(*filter_fields)
      filter_params_for nil, *filter_fields
    end

    def dev_test?
      %w(development test cucumber).include?(Rails.env)
    end

    def authenticate_user!(*args)
      if is_api?
        if !request.ssl? && !dev_test?
          send_error "API requests are only accepted over a secure connection (SSL)", :http_status => :upgrade_required
        else
          if request.headers.include?('HTTP_AUTHORIZATION')
            # try basic authentication first, [user-id]:[access-token]
            basic_token = request.headers['HTTP_AUTHORIZATION'].match(/Basic (.+)/)
            if basic_token.present?
              user_token = UserToken.where(:basic_authentication_token => basic_token[1] + "\n").limit(1)
              if user_token.present?
                sign_in_api_user user_token.first.user
              end
            else
              # try token authentication using header "Authentication: token [token]"
              standard_token = request.headers['HTTP_AUTHORIZATION'].match(/token (.+)/)
              if standard_token.present?
                user_token = UserToken.where(:access_token => standard_token[1]).limit(1)
                if user_token.present?
                  sign_in_api_user user_token.first.user
                end
              end
            end
          else
            # access_token passed in querystring param instead
            if request.params['access_token'].present?
              user_token = UserToken.where(:access_token => request.params['access_token']).limit(1)
              if user_token.present?
                sign_in_api_user user_token.first.user
              end
            elsif Rails.env.development? && request.params[:dev_api_user] # allow authentication via email address if on development
              sign_in_api_user User.find_by_email(request.params[:dev_api_user])
            end
          end

          if !user_signed_in?
            send_error "Invalid authentication details", :http_status => :unauthorized
          end
        end
      else
        # if not using API, just use standard Devise authentication
        super(*args)
      end
    end

    def prepare_api_request
      # ensure different content types are not cached http://www.informit.com/articles/article.aspx?p=1566460
      response.headers['Vary'] = 'Content-Type'
      # default to JSON for API requests unless an accept type has been specified
      request.format = 'json' unless request.headers.include?('HTTP_ACCEPT') && request.headers['HTTP_ACCEPT'] != '*/*'

      if request.format == 'html'
        send_error 'HTML is not a supported format for this API', :http_status => :not_acceptable
      end
    end

    def render_not_found
      send_error "#{error_scope_name} does not exist", :http_status => :not_found
    end

    # overwritten where name deviates from controller name
    def error_scope_name
      controller_name.humanize.singularize
    end

    def render_unprocessable_entity(e)
      protected_field_name = e.message.match(/^.*\: (.*)/) || [nil,'unknown']
      send_error "You cannot assign a value to the protected field '#{protected_field_name[1]}'", :http_status => :unprocessable_entity
    end

    def render_forbidden(e)
      send_error "#{e.message}", :http_status => :forbidden
    end
end
