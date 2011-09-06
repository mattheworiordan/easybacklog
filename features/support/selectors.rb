module SelectorHelpers
  # Maps a CSS or XPath selector to a name. Used by various steps

  def selector_to(section)
    case section

    ##
    # Dashboard page
    when /^backlog list$/
      'ul.backlog-list'

    ##
    # Backlog page
    when /^backlog heading$/
      '#backlog-data-area h2 .data'

    when /^backlog totals$/
      '#backlog-data-area .backlog-stats .output'

    when /^add snapshot button$/
      '#backlog-data-area .snapshot .new a'

    when /^snapshot icon$/
      '#backlog-data-area .snapshot .locked'

    when /^snapshot drop down$/
      '#backlog-data-area #snapshot-selector'

    ##
    # Backlog themes
    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme's (code|name|totals)$/
      position = string_quantity_to_numeric($1)
      selector = $2 == 'totals' ? '.theme-stats .metrics' : ".theme-data .#{$2} .data"
      "li.theme:#{position} #{selector}"

    when /^theme name$/
      'li.theme .theme-data .name .data'

    when /^theme code$/
      'li.theme .theme-data .code .data'

    when /^theme$/
      'li.theme'

    when /^add theme buttons?$/
      'ul.themes li.actions a.new-theme'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme$/
      position = string_quantity_to_numeric($1)
      "li.theme:#{position}"

    when /^(re-number|delete) of the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme$/
      selector = $1 == 're-number' ? '.re-number-stories' : '.delete-theme'
      position = string_quantity_to_numeric($2)
      "li.theme:#{position} .theme-actions #{selector} a"

    when /^backlog data area$/
      '#backlog-container'

    when /^name field of the first theme$/
      'ul.themes li.theme:nth-child(1) .theme-data .name'

    when /^move theme handle$/
      '.theme .move-theme'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme's add story button$/
      position = string_quantity_to_numeric($1)
      "li.theme:#{position} ul.stories li.actions a.new-story"

    ##
    # Backlog stories
    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) story's (.+?)(?: within the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme)?$/
      position = string_quantity_to_numeric($1)
      theme_scope = $3.blank? ? '' : "li.theme:#{string_quantity_to_numeric($3)} "
      selector = case $2
      when /code|unique id/i
        '.unique-id .data'
      when 'days'
        '.days-formatted .data'
      when 'cost'
        '.cost-formatted .data'
      when 'as field'
        '.as-a .data'
      when 'I want to field'
        '.i-want-to .data'
      when 'so I can field'
        '.so-i-can .data'
      when 'comments'
        '.comments .data'
      when '50 score'
        '.score-50 .data'
      when '90 score'
        '.score-90 .data'
      when 'duplicate'
        '.story-actions .duplicate-story a'
      when 'delete'
        '.story-actions .delete-story a'
      when 'drag handle'
        '.move-story a'
      when /colou?r picker/
        '.color-picker-icon a'
      else
        raise "Invalid story field '#{$2}'"
      end
      "#{theme_scope}li.story:#{position} #{selector}"

    when /^story code$/
      'li.story .unique-id'

    when /^story$/
      'ul.stories li.story'

    when /^add story buttons?$/
      'ul.themes ul.stories li.actions a.new-story'

    when /^delete theme buttons?$/
      'ul.themes li.theme .theme-actions .delete-theme a'

    ##
    # Generic selectors
    when /^(a|the) dialog(?:| box)$/
      '.ui-dialog'

    when /^colou?r picker$/
      '.color-picker'

    when /^(red|green) colou?r picker box$/
      color = ($1 == 'red' ? '#ff0000' : '#00ff00')
      ".color-picker:visible li.color-box[title=#{color}]"

    when /^editable text fields?$/
      'input[name=value],textarea[name=value]'

    else
      # no mapping exists, assume section is a CSS/XPath selector
      section
    end
  end

  def string_quantity_to_numeric(string_quantity)
    case string_quantity
      when 'first'
        'first-child'
      when 'second'
        'nth-child(2)'
      when 'third'
        'nth-child(3)'
      when 'fourth'
        'nth-child(4)'
      when 'fifth'
        'nth-child(5)'
      else
        "nth-child(#{position.gsub(/a-z/i,'').to_i})"
    end
  end
end

World(SelectorHelpers)