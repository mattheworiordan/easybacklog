module SelectorHelpers
  # Maps a CSS or XPath selector to a name. Used by various steps

  def selector_to(section)
    case section

    # backlog list on the Backlog page
    when /the backlog list/
      'ul.backlog-list'

    # backlog view page
    when /backlog heading/
      'h2'

    # generics
    when /a dialog(?:| box)/
      '.ui-dialog'

    else
      # no mapping exists, assume section is a CSS/XPath selector
      section
    end
  end
end

World(SelectorHelpers)
