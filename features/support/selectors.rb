module SelectorHelpers
  # Maps a CSS or XPath selector to a name. Used by various steps

  def selector_to(section)
    case section

    # backlog list on the Backlog page
    when /^backlog list$/
      'ul.backlog-list'

    # backlog view page
    when /^backlog heading$/
      '#backlog-data-area h2'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme's (code|name)$/
      params = section.match /(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme's (code|name)/
      position = string_quantity_to_numeric(params[1])
      "li.theme:nth-child(#{position}) .theme-data .#{params[2]} .data"

    when /^theme name$/
      'li.theme .theme-data .name'

    when /^theme code$/
      'li.theme .theme-data .code'

    when /^theme$/
      'li.theme'

    when /^delete of the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme$/
      params = section.match /delete of the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme/
      position = string_quantity_to_numeric(params[1])
      "li.theme:nth-child(#{position}) .theme-actions .delete-theme a"

    when /^backlog data area$/
      '#backlog-container'

    when /^name field of the first theme$/
      'ul.themes li.theme:nth-child(1) .theme-data .name'

    when /^move theme handle$/
      '.theme .move-theme'

    # generics
    when /^(a|the) dialog(?:| box)$/
      '.ui-dialog'

    else
      # no mapping exists, assume section is a CSS/XPath selector
      section
    end
  end

  def string_quantity_to_numeric(string_quantity)
    case string_quantity
      when 'first'
        1
      when 'second'
        2
      when 'third'
        3
      when 'fourth'
        4
      when 'fifth'
        5
      else
        position.gsub(/a-z/i,'').to_i
    end
  end
end

World(SelectorHelpers)
