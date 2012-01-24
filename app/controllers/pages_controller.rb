class PagesController < ApplicationController
  basic_allowed :contact, :browser_support

  def home
    # if user is signed in but not seen a previous page, then take them to the accounts page
    if user_signed_in? && session[:last_url].blank?
      redirect_to accounts_path
    end
    if user_signed_in?
      @recent_backlogs = current_user.accounts.map { |accounts| accounts.backlogs.active }.flatten.sort_by(&:updated_at).reverse[0..15]
    end
  end

  # /raise-error for testing error capture
  def raise_error
    raise "Intentional error thrown"
  end

  def status
    @users = User.count
  end
end