class BetaSignupsController < ApplicationController
  layout 'application.960'

  def index
    if user_signed_in?
      @recent_backlogs = current_user.companies.map { |company| company.backlogs.active }.flatten.sort_by(&:updated_at).reverse[0..10]
      render 'pages/home', :layout => 'application'
    else
      @beta_signup = BetaSignup.new
    end
  end

  def create
    render 'thank_you'
  end
end