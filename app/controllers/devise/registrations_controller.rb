class Devise::RegistrationsController < ApplicationController
  prepend_before_filter :require_no_authentication, :only => [ :new, :create, :cancel ]
  prepend_before_filter :authenticate_scope!, :only => [:edit, :update, :destroy]
  include Devise::Controllers::InternalHelpers

  # GET /resource/sign_up
  def new
    build_resource({})
    if params[:sign_up_code] != 'd7g3h2y'
      flash[:warning] = 'You need a valid sign up code to register'
      redirect_to new_session_path(resource)
    else
      @account = Account.new
      respond_with_navigational(resource){ render_with_scope :new }
    end
  end

  # POST /resource/sign_up
  def create
    build_resource

    # if user has visited sign_up by default they are asked to set up an account
    # if user comes from an embedded form (such as an invite), then account_setup is not shown as they are not setting up an account
    @account = (params[:show_account_setup] == 'true' ? Account.new(params[:account]) : nil)
    @account.save unless @account.blank?

    # if valid account created or if not creating an account at all (invited users)
    if resource.save && (@account.blank? || @account.valid?)
      @account.add_first_user resource unless @account.blank?
      flash[:notice] = 'Your new account has been created for you'
      sign_in(resource_name, resource)
      respond_with resource, :location => after_update_path_for(resource)
    else
      unless @account.blank?
        # error is added to locale yet select is using locale_id so does not highlight the error, therefore shift the error to locale_id
        if (@account.errors[:locale].present?)
          @account.errors.add(:locale_id, @account.errors[:locale].join(', '))
          @account.errors.delete(:locale)
        end
        @account.destroy # clean up the account as user account was not created
      end
      clean_up_passwords(resource)
      render_with_scope :new
    end
  end

  # GET /resource/edit
  def edit
    render_with_scope :edit
  end

  # PUT /resource
  def update
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)

    if resource.update_with_password(params[resource_name])
      # set_flash_message :notice, :updated if is_navigational_format?
      sign_in resource_name, resource, :bypass => true
      flash[:notice] = 'Your info has been updated'
      respond_with resource, :location => after_update_path_for(resource)
    else
      clean_up_passwords(resource)
      respond_with_navigational(resource){ render_with_scope :edit }
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

    # Overwrite redirect_for_sign_in so it takes uses after_sign_up_path_for.
    def redirect_location(scope, resource)
      stored_location_for(scope) || after_sign_up_path_for(resource)
    end

    # Returns the inactive reason translated.
    def inactive_reason(resource)
      reason = resource.inactive_message.to_s
      I18n.t("devise.registrations.reasons.#{reason}", :default => reason)
    end

    # The path used after sign up for inactive accounts. You need to overwrite
    # this method in your own RegistrationsController.
    def after_inactive_sign_up_path_for(resource)
      root_path
    end

    # The default url to be used after updating a resource. You need to overwrite
    # this method in your own RegistrationsController.
    def after_update_path_for(resource)
      if defined?(super)
        ActiveSupport::Deprecation.warn "Defining after_update_path_for in ApplicationController " <<
          "is deprecated. Please add a RegistrationsController to your application and define it there."
        super
      else
        after_sign_in_path_for(resource)
      end
    end

    # Authenticates the current scope and gets the current resource from the session.
    def authenticate_scope!
      send(:"authenticate_#{resource_name}!", true)
      self.resource = send(:"current_#{resource_name}")
    end
end
