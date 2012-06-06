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

  def export_totals(context)
    backlog = if context.respond_to? :cost_estimatable?
      context
    else
      # context is a theme
      context.backlog
    end

    totals = "#{format('%0.1f', context.points)} #{t (context.points == 1 ? 'backlog.totals.point' : 'backlog.totals.points')}"
    totals += " / #{context.cost_formatted}" if backlog.cost_estimatable?
    totals += " / #{context.days_formatted} #{t (context.days.to_f == 1 ? 'backlog.totals.day' : 'backlog.totals.days')}" if backlog.days_estimatable?
    totals
  end

  # return a class that redefines the style sheet used so that the days or cost columns are hidden if appropriate
  def reduced_column_class(backlog)
    if !backlog.days_estimatable?
      'no-days-or-cost'
    elsif !backlog.cost_estimatable?
      'no-cost'
    else
      ''
    end
  end

  def export_to_excel_column_count(backlog)
    total_columns = 7
    total_columns += 1 if @backlog.use_50_90? # 50/90 rule uses 2 columns
    total_columns += 1 if backlog.cost_estimatable?
    total_columns += 1 if backlog.days_estimatable?
    total_columns
  end

  def excel_xml_breaks(content)
    if content.blank?
      content
    else
      html_encoded = h(content)
      raw html_encoded.gsub(/[\n\r]/,'&#13;')
    end
  end

  def colour_styles(backlog)
    @colours = []
    backlog.themes.each do |theme|
      theme.stories.each do |story|
        if story.color.present? && story.color.match(/[a-f0-9]{6}/i)
          if !@colours.include?(story.color)
            @colours.push(story.color)
          end
        end
      end
    end
    raw(@colours.map.with_index do |color, idx|
      <<-XML
      <Style ss:ID='story-color-#{idx}'>
        <Borders>
          <Border ss:Position='Left' ss:Color='##{color}' ss:Weight='3' ss:LineStyle='Continuous' />
        </Borders>
      </Style>
      XML
    end.join("\n"))
  end

  def style_for_color(color)
    color_index = @colours.index(color)
    if color_index.present?
      " ss:StyleID='story-color-#{color_index}'"
    else
      ''
    end
  end
end