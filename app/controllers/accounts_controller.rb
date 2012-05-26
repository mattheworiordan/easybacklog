class AccountsController < ApplicationController
  before_filter :authenticate_user!, :except => :name_available
  basic_allowed :name_available

  respond_to :html
  respond_to :xml, :json, :only => [:index, :show, :update]

  ## included in API
  def index
    respond_with(current_user.accounts) do |format|
      format.html do
        redirect_to account_path(current_user.accounts.first) if current_user.accounts.length == 1
        @accounts = current_user.accounts.with_backlog_counts.order('LOWER(name)')
      end
    end
  end

  def archives
    @account = Account.find(params[:id])
    @archives = @account.archived_backlogs_grouped_by_company(current_user)
    @your_backlogs = @account.active_backlogs_grouped_by_company(current_user)
  end

  ## included in API
  def show
    @account = Account.find(params[:id])

    @current_account = @account # used for current_account method of Application controller
    user_belongs_to_this_account = @account.present? && @account.users.where(:id => current_user.id).present?

    if !user_belongs_to_this_account
      send_error 'You do not have permission to view this account', :redirect_to => accounts_path, :http_status => :forbidden
    else
      respond_with(@account) do |format|
        format.html do
          @backlogs = @account.backlogs.active.order('updated_at desc').where_user_has_access(current_user).limit(15)
          @your_backlogs = @account.active_backlogs_grouped_by_company(current_user)
          @archive_exists = !@account.backlogs.archived.where_user_has_access(current_user).empty?
        end unless is_api?
      end
    end
  end

  def edit
    @account = Account.find(params[:id])
    @current_account = @account # so that nav is shown correctly
    if cannot?(:full)
      flash[:error] = 'You do not have permission to edit this account'
      redirect_to account_path(@account)
    end
  end

  ## included in API
  def update
    @account = Account.find(params[:id])
    if cannot?(:full)
      send_error 'You do not have permission to edit this account', :redirect_to => account_path(@account), :http_status => :forbidden
    else
      if @account.update_attributes(filter_account_params)
        respond_with(@account) do |format|
          format.html do
            flash[:notice] = "Account for #{@account.name} updated successfully"
            redirect_to account_path(@account)
          end
        end
      else
        respond_to do |format|
          format.html do
            flash[:warning] = 'Account was not updated'
            render :action => 'edit'
          end
          format.all { send_error @account, :http_status => :unprocessable_entity }
        end
      end
    end
  end

  def new
    @account = Account.new
  end

  def create
    @account = Account.new(filter_account_params)
    if @account.save
      @account.setup_account_for_user current_user
      flash[:notice] = 'Account was successfully created.'
      redirect_to(@account)
    else
      # locale errors are actually shown on the locale_id element
      if (@account.errors[:locale].present?)
        @account.errors.add(:locale_id, @account.errors[:locale].join(', '))
        @account.errors.delete(:locale)
      end
      render :action => "new"
    end
  end

  def name_available
    account_name = (params[:account] || {})[:name] || ''
    if (params[:except] || '').upcase == account_name.upcase
      render :text => 'true'
    elsif Account.where('UPPER(name) like ?', account_name.upcase).empty?
      render :text => 'true'
    else
      render :text => 'false'
    end
  end

  helper_method :can?, :cannot?
  def can?(method)
    @account.can? method, current_user
  end
  def cannot?(method)
    !can? method
  end

  private
    def filter_account_params
      params_namespace = is_api? ? nil : :account
      filter_params_for params_namespace, :defaults_set, :days_estimatable, :has_company
    end
end