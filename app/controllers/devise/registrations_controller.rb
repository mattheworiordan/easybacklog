class Devise::RegistrationsController < ApplicationController
  prepend_before_filter :require_no_authentication, :only => [ :new, :create ]
  prepend_before_filter :authenticate_scope!, :only => [:edit, :update, :destroy]
  include Devise::Controllers::InternalHelpers

  ssl_required :new, :create, :edit, :update, :destroy  if use_ssl?

  # GET /resource/sign_up
  def new
    build_resource({})
    @company = Company.new
    render_with_scope :new
  end

  # POST /resource/sign_up
  def create
    build_resource

    # if user has visited sign_up by default they are asked to set up an account
    # if user comes from an embedded form (such as an invite), then account_setup is not shown as they are not setting up an account
    @company = (params[:show_account_setup] == 'true' ? Company.new(params[:company]) : nil)
    @company.save unless @company.blank?

    if resource.save && (@company.blank? || @company.valid?)
      @company.add_first_user resource unless @company.blank?
      set_flash_message :notice, :signed_up
      sign_in_and_redirect(resource_name, resource)
    else
      unless @company.blank?
        # error is added to locale yet select is using locale_id so does not highlight the error, therefore shift the error to locale_id
        if (@company.errors.on(:locale))
          @company.errors.add(:locale_id, @company.errors.on(:locale).to_s)
          @company.errors.delete(:locale)
        end
        @company.destroy # clean up the company as user account was not created
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
    if resource.update_with_password(params[resource_name])
      set_flash_message :notice, :updated
      redirect_to after_update_path_for(resource)
    else
      clean_up_passwords(resource)
      render_with_scope :edit
    end
  end

  # DELETE /resource
  def destroy
    resource.destroy
    set_flash_message :notice, :destroyed
    sign_out_and_redirect(self.resource)
  end

  protected

    # Authenticates the current scope and gets a copy of the current resource.
    # We need to use a copy because we don't want actions like update changing
    # the current user in place.
    def authenticate_scope!
      send(:"authenticate_#{resource_name}!")
      self.resource = resource_class.find(send(:"current_#{resource_name}").id)
    end
end
