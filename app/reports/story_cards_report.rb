class StoryCardsReport
  BOXES_PER_PAGE = 4
  PAGE_SIZES = {
    :A4 => OpenStruct.new(:width => 841.89, :height => 595.28, :margin_x => 30, :margin_y => 30),
    :legal => OpenStruct.new(:width => 792.00, :height => 612.00, :margin_x => 30, :margin_y => 30)
  }

  def to_pdf(backlog)
    page_size = 'A4'
    page_dimensions = PAGE_SIZES[page_size.to_sym]
    document_options = { 
      :page_size => page_size, 
      :page_layout => :landscape, 
      :left_margin => page_dimensions.margin_x,
      :right_margin => page_dimensions.margin_x,
      :top_margin => page_dimensions.margin_y,
      :bottom_margin => page_dimensions.margin_y
      }
    pdf = Prawn::Document.new(document_options)
    @box_count = 0

    backlog.themes.each do |theme|
      theme.stories.each do |story|
        add_story(pdf, document_options, page_size, story)
      end
    end

    pdf.render
  end

  private 
    def add_story(pdf, document_options, page_size, story)
      page_dimensions = PAGE_SIZES[page_size.to_sym]
      card_width = (page_dimensions.width - page_dimensions.margin_x*2)/2
      card_height = (page_dimensions.height - page_dimensions.margin_y*2)/2

      pdf.bounding_box box_offset(0.05, 0.95, @box_count, page_size), :width => card_width*0.95, :height => card_height * 0.95 do
        pdf.text_box "Project: #{story.theme.backlog.name}",
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.9],
          :width => pdf.bounds.width * 0.65,
          :height => pdf.bounds.height * 0.1,
          :size => 14
        pdf.formatted_text_box [{:text => "Code:"},{:text => "#{story.theme.code}#{story.unique_id}", :styles => [:bold]}],
          :align => :right, :size => 16,
          :at => [pdf.bounds.width * 0.70, pdf.bounds.height * 0.9],
          :width => pdf.bounds.width/4,
          :height => pdf.bounds.height * 0.1
        pdf.text_box "Theme: #{story.theme.name}",
          :size => 15,
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.8],
          :width => pdf.bounds.width,
          :height => pdf.bounds.height * 0.1
        pdf.formatted_text_box [
            {:text => "As a "}, {:text => "#{story.as_a}", :styles => [:bold]},
            {:text => "\nI want to "}, {:text => "#{story.i_want_to}", :styles => [:bold]},
            {:text => "\nSo I can "}, {:text => "#{story.so_i_can}", :styles => [:bold]}
          ],
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.65],
          :width => pdf.bounds.width * 0.9,
          :height => pdf.bounds.height * 0.6,
          :size => 20
        pdf.stroke do
          pdf.rectangle pdf.bounds.top_left, pdf.bounds.width, pdf.bounds.height
        end
      end

      @box_count = @box_count + 1
      pdf.start_new_page(document_options) if (@box_count.modulo(BOXES_PER_PAGE) == 0)
    end

    # offset position based on which box is being worked on and scaled according to page size
    # x & y is a value from 0% to 100% i.e. 0.0 to 1.0
    # [0][1]
    # [2][3]
    # returns [x,y]
    def box_offset(x, y, box_position, page_size)
      page_dimensions = PAGE_SIZES[page_size.to_sym]
      card_width = (page_dimensions.width - page_dimensions.margin_x*2)/2
      card_height = (page_dimensions.height - page_dimensions.margin_y*2)/2

      offset = case box_position.modulo(BOXES_PER_PAGE)
        when 0 then [0, card_height]
        when 1 then [card_width, card_height]
        when 2 then [0, 0]
        when 3 then [card_width, 0]
      end
      puts "#{[offset[0] + x.to_f * card_width, offset[1] + y.to_f * card_height]}"
      [offset[0] + x.to_f * card_width, offset[1] + y.to_f * card_height]
    end

    # HTML encode
    def h(unescaped)
      CGI::escapeHTML("#{unescaped}")
    end
end