module BacklogsHelper
  def backlog_date(backlog)
    l backlog.created_at, :format => :long, :locale => backlog.company.locale.code.to_sym
  end
end