module ApiHelper
  def defintion_url_wrappable(url)
    url = h(url)
    url = url.gsub(/\//, "#{content_tag('span', '')}/")
    raw "#{api_end_point}#{url}"
  end

  def demo_api_user
    User.find_by_email('demo-api@easybacklog.com')
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

  def demo_api_backlogs
    demo_api_user.accounts.first.backlogs.active.order('created_at asc')
  end

  def demo_api_backlog
    demo_api_backlogs.first
  end

  def demo_api_backlog_id
    demo_api_backlog.id rescue '{BACKLOG_ID}'
  end

  def demo_api_2nd_backlog_id
    demo_api_backlogs.second.id rescue '{BACKLOG_ID}'
  end

  def demo_api_snapshot_id
    demo_api_backlog.snapshots.first.id rescue '{SNAPSHOT_ID}'
  end

  def demo_api_theme_id
    demo_api_backlog.themes.first.id rescue '{THEME_ID}'
  end

  def demo_api_2nd_theme_id
    demo_api_backlog.themes.second.id rescue '{THEME_ID}'
  end

  def demo_api_story_id
    demo_api_backlog.themes.first.stories.first.id rescue '{STORY_ID}'
  end

  def demo_api_acceptance_criterion_id
    demo_api_backlog.themes.first.stories.first.acceptance_criteria.first.id rescue '{ACCEPTANCE_CRITERIA_ID}'
  end

  def demo_api_company_id
    demo_api_user.accounts.first.companies.first.id rescue '{COMPANY_ID}'
  end

  def demo_api_sprint_id
    demo_api_backlog.sprints.first.id rescue '{SPRINT_ID}'
  end

  def demo_api_sprint_story_id
    demo_api_backlog.sprints.first.sprint_stories.first.id rescue '{SPRINT_STORY_ID}'
  end

  def demo_api_locale_id
    Locale.first.id rescue '{LOCALE_ID}'
  end

  def demo_api_scoring_rule_id
    ScoringRule.first.id rescue '{SCORING_RULE_ID}'
  end

  def demo_api_sprint_story_status_id
    SprintStoryStatus.first.id rescue '{SPRINT_STORY_STATUS_ID}'
  end

  def api_end_point
    if Rails.env.development?
      'http://api-local:3000/'
    elsif Rails.env.test?
      'https://api.easybacklog.com/'
    else
      "https://#{request.host}/"
    end
  end
end