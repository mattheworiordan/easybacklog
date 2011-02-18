require 'culerity'

Before do
  $rails_server_pid ||= Culerity::run_rails(:environment => 'culerity', :port => 3001)
  $server ||= Culerity::run_server
  unless $browser
    $browser = Culerity::RemoteBrowserProxy.new $server, {:browser => :firefox3,
      :javascript_exceptions => true,
      :resynchronize => true,
      :status_code_exceptions => true
    }
    $browser.log_level = :warning
  end
  @host = 'http://localhost:3001'
end

After do
  $server.clear_proxies
  $browser.clear_cookies
end

at_exit do
  $browser.exit if $browser
  $server.exit_server if $server
  Process.kill(6, $rails_server_pid) if $rails_server_pid
end