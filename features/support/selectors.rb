module HtmlSelectorHelpers
  # Maps a CSS or XPath selector to a name. Used by various steps

  def selector_to(location)
    case location

    ##
    # Dashboard page
    when /^backlog list$/
      'ul.backlog-list'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) company heading in a dashboard list$/
      position = string_quantity_to_numeric($1) * 2
      "section.main-content-pod .dash-board-company:nth-child(#{position})"

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) backlog list in a dashboard list$/
      position = string_quantity_to_numeric($1) * 2 + 1
      "section.main-content-pod .backlog-list:nth-child(#{position})"

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) company heading in your backlog list$/
      position = string_quantity_to_numeric($1) * 2 - 1
      ".your-back-list-side-panel .company:nth-child(#{position})"

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) backlog list in your backlog list$/
      position = string_quantity_to_numeric($1) * 2
      ".your-back-list-side-panel .your-backlog-list:nth-child(#{position})"

    ##
    # New Backlog page
    when /^new backlog company drop down$/
      'select#backlog_company_id'

    when /^new backlog new company field$/
      'input#company_name'

    ##
    # Backlog page
    when /^backlog heading$/
      '#backlog-data-area h2.name'

    when /^backlog company$/
      '#backlog-data-area h3.company'

    when /^backlog totals$/
      '#backlog-data-area .backlog-stats .output'

    when /^snapshots menu$/
      '#backlog-data-area a#snapshot-menu'

    when /^filter menu$/
      '#backlog-data-area .actions .filter'

    when /^filter notifier$/
      '#backlog-container .filter-notifier'

    when /^create new snapshot button$/
      'a#new-snapshot'

    when /^compare snapshots button$/
      'a#compare-snapshot'

    when /^snapshot icons?$/
      'h2.locked'

    when /^snapshot drop down appearing in snapshot mode near tabs$/
      '#viewing-snapshot-container select.snapshot-selector'

    when /^snapshot drop down within snapshots menu$/
      '.snapshot-menu-container select.snapshot-selector'

    ##
    # Backlog themes
    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme's (code|name|totals)$/
      position = string_quantity_to_numeric_pseudo_selector($1)
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
      position = string_quantity_to_numeric_pseudo_selector($1)
      "li.theme:#{position}"

    when /^(re-number|delete) of the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme$/
      selector = $1 == 're-number' ? '.re-number-stories' : '.delete-theme'
      position = string_quantity_to_numeric_pseudo_selector($2)
      "li.theme:#{position} .theme-actions #{selector} a"

    when /^backlog data area$/
      '#backlog-container'

    when /^name field of the first theme$/
      'ul.themes li.theme:nth-child(1) .theme-data .name'

    when /^move theme handle$/
      '.theme .move-theme'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme's add story button$/
      position = string_quantity_to_numeric_pseudo_selector($1)
      "li.theme:#{position} ul.stories li.actions a.new-story"

    ##
    # Backlog stories
    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) story(?:'s )?(.+?)?(?: within the (first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) theme)?$/
      position = string_quantity_to_numeric_pseudo_selector($1)
      theme_scope = $3.blank? ? '' : "li.theme:#{string_quantity_to_numeric_pseudo_selector($3)} "
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
      when 'score'
        '.score .data'
      when 'duplicate'
        '.story-actions .duplicate-story a'
      when 'delete'
        '.story-actions .delete-story a'
      when 'drag handle'
        '.move-story a'
      when /colou?r picker/
        '.color-picker-icon a'
      when nil
        # matching the entire story element
        ''
      else
        raise "Invalid story field '#{$2}'"
      end
      "#{theme_scope}li.story:#{position} #{selector}"

    when /^story code$/
      'li.story .unique-id'

    when /^story score$/
      'li.story .score'

    when /^story$/
      'ul.stories li.story'

    when /^add story buttons?$/
      'ul.themes ul.stories li.actions a.new-story'

    when /^delete theme buttons?$/
      'ul.themes li.theme .theme-actions .delete-theme a'

    when /^done stor(?:y|ies)$/
      'ul.themes li.theme li.story.locked:visible'

    ##
    # Acceptance criteria
    when /^edit acceptance criteria field within (?:the )?(.*)$/
      "#{selector_to($1)} ul.acceptance-criteria li.new-acceptance-criterion div"

    when /^acceptance criteri(?:on|a)$/
      'ul.acceptance-criteria li.criterion .data'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) acceptance criteri(?:on|a)$/
      position = string_quantity_to_numeric_pseudo_selector($1)
      "ul.acceptance-criteria li.criterion:#{position} .data"

    ##
    # Backlog snapshots
    when /^changed base user story value$/
      'tr[bgcolor="#FFFFFF"] td:nth-child(2) .changed'

    when /^changed target user story value$/
      'tr[bgcolor="#FFFFFF"] td:nth-child(10) .changed'


    when /^snapshot (added|deleted|modified or identical) rows?$/
      case $1
      when 'added'
        'tr[bgcolor=#AAFFAA]'
      when 'deleted'
        'tr[bgcolor=#FFAAAA]'
      else
        'tr[bgcolor=#FFFFFF]'
      end

    ## Backlog tabs
    #
    when /^(.*) backlog tab$/
      "#backlog-tabs li:not(.scroller):contains(#{$1}) a, #backlog-settings-tabs li:not(.scroller):contains(#{$1}) a"

    ## Backlog sprints
    #
    when /^add sprint button$/
      '#backlog-tabs #add-sprint a'

    when /^new sprint dialog box$/
      '.ui-dialog #dialog-new-sprint'

    when /^new sprint estimation question$/
      '#dialog-new-sprint tr.question'

    when /^edit sprint estimation question$/
      'form.edit_sprint div.question'

    when /^new sprint expected velocity$/
      '#dialog-new-sprint #expected-velocity'

    when /^edit sprint expected velocity$/
      'form.edit_sprint #expected-velocity'


    ## Backlog stats
    #
    when /^stats tab area$/
      "#stats-container"

    when /^stats placeholder image$/
      "#stats-container .no-stats .stats-placeholder"

    when /^(average|expected) velocity per (day|sprint)$/
      "table.comparison #velocity-per-#{$2}-#{$1}"

    when /^(burn down|burn up|velocity) chart$/
      chart = case $1
        when 'burn down'
          'burn-down-chart'
        when 'burn up'
          'burn-up-chart'
        when 'velocity'
          'velocity-chart'
      end
      ".stats ##{chart} .highcharts-container"

    when /^backlog stats for individual velocity$/
      'table.comparison tr.per-day'

    ##
    # Backlog settings
    when /^non editable notice$/
      '.not-editable-notice'

    when /^backlog setting company drop down$/
      '.existing select#backlog_company_id'

    when /^backlog velocity$/
      'input#backlog_velocity'

    when /^backlog rate$/
      'input#backlog_rate'

    ##
    # Backlog print
    when /^print story cards dialog$/
      ".ui-dialog #dialog-print"

    when /^print story card dialog scope drop down$/
      '.ui-dialog #dialog-print select#print-scope'

    ##
    # Backlog guiders
    when /^visible guider$/
      '.guider:visible'

    ##
    # Company

    when /^company velocity$/
      'input#company_default_velocity'

    when /^company rate$/
      'input#company_default_rate'


    ##
    # Beta sign up launch page
    when /^visible story card$/
      '.dual-cards .card.visible'

    when /^(first|second|third|fourth|fifth|\d+(?:th|st|nd|rd)) beta feature$/
      position = string_quantity_to_numeric_pseudo_selector($1)
      ".feature-nav ul li:#{position}"

    when /^beta page error message$/
      '.request-access .error-message'

    when /^beta page request access area$/
      '.request-access'

    ## Account settings
    #
    when /^account velocity$/
      'input#account_default_velocity'

    when /^account rate$/
      'input#account_default_rate'

    ##
    # Account user management, invite and sign up
    when /^account user$/
      'table.users tr:has(td)'

    when /^account user table$/
      'table.users'

    when /^account user table$/
      'table.users'

    when /^invite user table$/
      'table.invites'

    when /^revoke invite icon for (.+)$/
      "table.invites tr:contains(#{$1}) td:last-child a"

    when /^delete user icon for (.+)$/
      "table.users tr:contains(#{$1}) td:last-child a"

    when /^sign up form$/
      '.sign-up form'

    when /^this field is required messages?$/
      'label.error:contains(This field is required)'

    when /^Sign Up Account Name$/
      'input#account_name'

    when /^Sign Up Email$/
      'input#user_email'

    ##
    # Generic and other selectors
    when /^(a|the|) dialog(?:| box)$/
      '.ui-dialog'

    when /^move story dialog theme drop down$/
      '.ui-dialog select#theme-target'

    when /^colou?r picker$/
      '.color-picker'

    when /^(red|green) colou?r picker box$/
      color = ($1 == 'red' ? '#ff0000' : '#00ff00')
      ".color-picker:visible li.color-box[title=#{color}]"

    when /^editable text fields?$/
      'input[name=value],textarea[name=value]'

    when /^text input fields$/
      'input[type=text]'

    when /^checkboxes$/
      'input[type=checkbox]'

    when /^radio buttons$/
      'input[type=radio]'

    when /^(un)checked checkboxes$/
      "input[type=checkbox]:#{$1 == 'un' ? ':not(:checked)' : ':checked'}"

    when /^drop down options with the text .+$/
      "select option:contains($1)"

    when /^submit button$/
      'input[type=submit]'

    when /^primary page heading$/
      'section.title h1'

    when /^top nav$/
      'header'

    when /^date picker$/
      '#ui-datepicker-div'

    else
      supports_javascript = page.evaluate_script('true') rescue false
      # if location does not already look like a selector
      if supports_javascript && location.present? && location.kind_of?(String) && !(location =~ /^[a-z0-9_-]*[\.#][a-z_-]+/i)
        # try and find a label containing the text set for location which is pointing to a form element
        label_selector = page.evaluate_script <<-JS
          // wrap in try catch so we don't get script errors
          var ret = false;
          try {
            ret = $('label:contains("#{location.gsub(/"/, '')}")').attr('for');
          } catch (e) { true; }
          ret;
        JS
        if label_selector.present? && page.evaluate_script("$('form ##{label_selector}').length") >= 1
          location = "##{label_selector}"
        end
      end
      # no mapping exists, assume location is a CSS/XPath selector
      location
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
        string_quantity.gsub(/a-z/i,'').to_i
    end
  end

  def string_quantity_to_numeric_pseudo_selector(string_quantity)
    string_quantity = string_quantity_to_numeric(string_quantity)
    case string_quantity
      when 1
        'first-child'
      else
        "nth-child(#{string_quantity})"
    end
  end
end

World(HtmlSelectorHelpers)
