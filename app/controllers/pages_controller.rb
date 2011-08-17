class PagesController < ApplicationController
  ssl_required :home if use_ssl?

  def home
    # if user is signed in but not seen a previous page, then take them to the companies page
    if user_signed_in? && session[:last_url].blank?
      redirect_to companies_path
    end
    if user_signed_in?
      @recent_backlogs = current_user.companies.map { |company| company.backlogs.active }.flatten.sort_by(&:updated_at).reverse[0..10]
    end
  end

  # /raise-error for testing error capture
  def raise_error
    raise "Intentional error thrown"
  end

  # override ssl_required
  def ssl_required?
    user_signed_in? && self.class.use_ssl?
  end
end