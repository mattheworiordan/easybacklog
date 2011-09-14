class BetaSignupsNotifier < ActionMailerBase
  # send a confirmation when someone applies for access
  def receipt_of_application(email, tweet_url)
    @email = email
    @tweet_url = tweet_url
    mail(:to => email, :subject => 'easyBacklog early access application') do |format|
      format.text
    end
  end

  def notify_admin_of_new_signup(email, company, tweet_url)
    @email = email
    @tweet_url = tweet_url
    @company = company
    mail(:to => 'beta@easybacklog.com', :subject => 'easyBacklog early access application received') do |format|
      format.text
    end
  end
end
