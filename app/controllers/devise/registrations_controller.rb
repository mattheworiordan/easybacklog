class Devise::RegistrationsController < DeviseController
  prepend_before_filter :require_no_authentication, :only => [ :new, :create, :cancel ]
  prepend_before_filter :authenticate_scope!, :only => [:edit, :update, :destroy]

  # GET /resource/sign_up
  def new
    build_resource({})
    @account = Account.new
    resource = build_resource({})
    respond_with resource
  end

  # POST /resource/sign_up
  def create
    build_resource

    # if user has visited sign_up by default they are asked to set up an account
    # if user comes from an embedded form (such as an invite), then account_setup is not shown as they are not setting up an account
    Account.transaction do
      @account = (params[:show_account_setup] == 'true' ? Account.new(filter_params_for(:account, :defaults_set, :days_estimatable)) : nil)
      @account.save unless @account.blank?

      # if valid account created or if not creating an account at all (invited users)
      if resource.save && (@account.blank? || @account.valid?)
        if @account.present? # new account is being setup
          @account.setup_account_for_user resource
        end
        flash[:notice] = 'Your new account has been created for you'
        sign_in(resource_name, resource)
        respond_with resource, :location => after_update_path_for(resource)
        UsersNotifier.delay(:queue => 'mailer').new_user(resource.id, @account.id) if @account.present? # send a notification to an admin
      else
        unless @account.blank?
          # error is added to locale yet select is using locale_id so does not highlight the error, therefore shift the error to locale_id
          if (@account.errors[:locale].present?)
            @account.errors.add(:locale_id, @account.errors[:locale].join(', '))
            @account.errors.delete(:locale)
          end
          @account.destroy # clean up the account as user account was not created
        end
        clean_up_passwords resource
        respond_with resource
      end
    end
  end

  # GET /resource/edit
  def edit
    render :edit
  end

  # PUT /resource
  def update
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)

    if resource.update_with_password(params[resource_name])
      # set_flash_message :notice, :updated if is_navigational_format?
      sign_in resource_name, resource, :bypass => true
      flash[:notice] = 'Your settings have been updated'
      respond_with resource, :location => after_update_path_for(resource)
    else
      clean_up_passwords(resource)
      respond_with resource
    end
  end

  # DELETE /resource
  def destroy
    resource.destroy
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
    set_flash_message :notice, :destroyed if is_navigational_format?
    respond_with_navigational(resource){ redirect_to after_sign_out_path_for(resource_name) }
  end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  def cancel
    expire_session_data_after_sign_in!
    redirect_to new_registration_path(resource_name)
  end

  protected

    # Build a devise resource passing in the session. Useful to move
    # temporary session data to the newly created user.
    def build_resource(hash=nil)
      hash ||= params[resource_name] || {}
      self.resource = resource_class.new_with_session(hash, session)
    end

    # The path used after sign up. You need to overwrite this method
    # in your own RegistrationsController.
    def after_sign_up_path_for(resource)
      after_sign_in_path_for(resource)
    end

    # The path used after sign up for inactive accounts. You need to overwrite
    # this method in your own RegistrationsController.
    def after_inactive_sign_up_path_for(resource)
      respond_to?(:root_path) ? root_path : "/"
    end

    # The default url to be used after updating a resource. You need to overwrite
    # this method in your own RegistrationsController.
    def after_update_path_for(resource)
      after_sign_in_path_for(resource)
    end

    # Authenticates the current scope and gets the current resource from the session.
    def authenticate_scope!
      send(:"authenticate_#{resource_name}!", :force => true)
      self.resource = send(:"current_#{resource_name}")
    end
end
