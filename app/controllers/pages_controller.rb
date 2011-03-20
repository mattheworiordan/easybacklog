class PagesController < ApplicationController
  def home
    # if user is signed in but not seen a previous page, then take them to the companies page
    if user_signed_in? && session[:last_url].blank?
      redirect_to companies_path
    end
  end
end