class WelcomeController < ApplicationController
  layout 'application.960'
  basic_allowed :index, :create
  use_vanity :current_user

  def index
    if user_signed_in?
      flash.keep
      redirect_to logged_in_user_home_path
    else
      # old legacy beta referral code
      @beta_signup = BetaSignup.new
      unless params[:unique_code].blank?
        referral_beta_signup = BetaSignup.where(:unique_code => params[:unique_code])
        if (referral_beta_signup.count > 0)
          referral_beta_signup.first.log_click
        end
      end
    end
  end
end