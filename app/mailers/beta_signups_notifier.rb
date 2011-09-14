class BetaSignupsNotifier < ActionMailerBase
  # send a confirmation when someone applies for access
  def receipt_of_application(email, tweet_url)
    @email = email
    @tweet_url = tweet_url
    mail(:to => email, :bcc => ['matt@easybacklog.com'], :subject => 'easyBacklog early access application') do |format|
      format.text
    end
  end
end
