module ApiHelper
  def defintion_url_wrappable(url)
    url = h(url)
    url = url.gsub(/\//, "#{content_tag('span', '')}/")
    raw "#{api_end_point}#{url}"
  end

  def demo_api_user
    cache_key = 'demo_api_user'
    if (Rails.cache.exist?(cache_key))
      Rails.cache.fetch(cache_key)
    else
      user = User.find_by_email('demo-api@easybacklog.com')
      Rails.cache.write(cache_key, user, :expires_in => 10)
      user
    end
  end

  def demo_api_user_id
    demo_api_user ? demo_api_user.id : '{USER_ID}'
  end

  def demo_api_user_token
    demo_api_user && demo_api_user.user_tokens.present? ? demo_api_user.user_tokens.first.access_token : '{API_KEY}'
  end

  def demo_api_account_id
    demo_api_user.accounts.first.id rescue '{ACCOUNT_ID}'
  end

  def demo_api_backlog
    demo_api_user.accounts.first.backlogs.order('created_at asc').first
  end

  def demo_api_backlog_id
    demo_api_backlog.id rescue '{BACKLOG_ID}'
  end

  def demo_api_snapshot_id
    demo_api_backlog.snapshots.first.id rescue '{SNAPSHOT_ID}'
  end

  def api_end_point
    Rails.env.development? ? 'http://api-local:3000/' : "https://#{request.host}/"
  end
end