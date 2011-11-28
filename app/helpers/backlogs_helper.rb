module BacklogsHelper
  def backlog_date(backlog)
    I18n.l backlog.updated_at, :format => :short, :locale => backlog.account.locale.code.to_sym
  end

  # if JSON is embedded in CDATA Javascript and there is a value of </script> it closes the opening <script> tag incorrectly
  def embedded_json_safe(json)
    json.gsub(/<\/script>/i,'<" + "/script>')
  end

  def sprint_story_statuses_json
    SprintStoryStatus.all.to_json
  end

  def export_totals(points, cost, days)
    "#{format('%0.1f', points)} #{t (points == 1 ? 'backlog.totals.point' : 'backlog.totals.points'), :default => 'points'}" +
    " / #{cost}" +
    " / #{days} #{t (days.to_f == 1 ? 'backlog.totals.day' : 'backlog.totals.days'), :default => 'days'}"
  end
end