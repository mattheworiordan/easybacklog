module NavigationHelpers
  # Maps a name to a path. Used by the
  #
  #   When /^I go to (.+)$/ do |page_name|
  #
  # step definition in web_steps.rb
  #
  def path_to(page_name)
    case page_name

    when /the home\s?page/
      root_path

    when /the accounts page/
      accounts_path

    when /the new account page/
      new_account_path

    when /the backlog "([^"]+)" page/
      backlog = Backlog.find_by_name($1)
      account_backlog_path(backlog.account, backlog)

    when /the snapshot base "([^"]+)" and backlog "([^"]+)" Excel export page$/
      backlog = Backlog.find_by_name($2)
      base_snapshot = Backlog.find_by_name($1)
      compare_snapshots_account_backlogs_path(backlog.account, base_snapshot, backlog, :format => 'xls')

    # Add more mappings here.
    # Here is an example that pulls values out of the Regexp:
    #
    #   when /^(.*)'s profile page$/i
    #     user_profile_path(User.find_by_login($1))

    else
      begin
        page_name =~ /^the (.*) page$/
        path_components = $1.split(/\s+/)
        self.send(path_components.push('path').join('_').to_sym)
      rescue NoMethodError, ArgumentError
        raise "Can't find mapping from \"#{page_name}\" to a path.\n" +
          "Now, go and add a mapping in #{__FILE__}"
      end
    end
  end
end

World(NavigationHelpers)
