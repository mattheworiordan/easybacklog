module BacklogsHelper
  def backlog_date(backlog)
    l backlog.created_at, :format => :long, :locale => backlog.company.locale.code.to_sym
  end

  # if JSON is embedded in CDATA Javascript and there is a value of </script> it closes the opening <script> tag incorrectly
  def embedded_json_safe(json)
    json.gsub(/<\/script>/i,'<" + "/script>')
  end
end