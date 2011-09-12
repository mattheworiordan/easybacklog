class BetaSignupsController < ApplicationController
  layout 'application.960'

  def index
    if user_signed_in?
      @recent_backlogs = current_user.accounts.map { |account| account.backlogs.active }.flatten.sort_by(&:updated_at).reverse[0..10]
      render 'pages/home', :layout => 'application'
    else
      @beta_signup = BetaSignup.new
      if (params[:unique_code])
        referral_beta_signup = BetaSignup.where(:unique_code => params[:unique_code])
        if (referral_beta_signup.count > 0)
          referral_beta_signup.first.log_click
        end
      end
    end
  end

  def create
    @beta_signup = BetaSignup.find_or_create_by_email(params[:beta_signup][:email])
    @beta_signup.company = params[:beta_signup][:company]
    if @beta_signup.save
      render 'thank_you'
    else
      flash.now[:error] = 'You must enter a valid email address'
      render 'index'
    end
  end

  def get_short_url
    bitly = Shortly::Clients::Bitly
    bitly.apiKey  = 'R_307345880bbf4768a139b0df71374269'
    bitly.login   = 'mattheworiordan'
    if (Rails.env.development?)
      bitly.shorten('http://easybacklog.com' + beta_signup_referral_path(@beta_signup.unique_code)).url
    else
      bitly.shorten(beta_signup_referral_url(@beta_signup.unique_code)).url
    end
  end
  helper_method :get_short_url
end