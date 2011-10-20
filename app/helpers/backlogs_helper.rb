module BacklogsHelper
  def backlog_date(backlog)
    I18n.l backlog.created_at, :format => :short, :locale => backlog.account.locale.code.to_sym
  end

  # if JSON is embedded in CDATA Javascript and there is a value of </script> it closes the opening <script> tag incorrectly
  def embedded_json_safe(json)
    json.gsub(/<\/script>/i,'<" + "/script>')
  end

  def sprint_statuses_json
    SprintStatus.all.to_json
  end
end