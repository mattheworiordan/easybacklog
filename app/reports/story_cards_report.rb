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

      # create the reverse page if on first box
      pdf.start_new_page(document_options) if (@box_count.modulo(BOXES_PER_PAGE) == 0)

      # let's work on the first page
      pdf.go_to_page pdf.page_count-1

      offset = box_offset(0.05, 0.95, @box_count, page_size)
      standard_box_fields(story, pdf, offset, card_width*0.9, card_height*0.9) do
        pdf.formatted_text_box [
            {:text => "As a "}, {:text => "#{story.as_a}", :styles => [:bold]},
            {:text => "\nI want to "}, {:text => "#{story.i_want_to}", :styles => [:bold]},
            {:text => "\nSo I can "}, {:text => "#{story.so_i_can}", :styles => [:bold]}
          ],
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.65],
          :width => pdf.bounds.width * 0.9,
          :height => pdf.bounds.height * 0.6,
          :size => 20
      end

      # let's work on the first page
      pdf.go_to_page pdf.page_count

      offset = mirror_box_offset(0.05, 0.95, @box_count, page_size)
      standard_box_fields(story, pdf, offset, card_width*0.9, card_height*0.9) do
        acceptance_criteria = story.acceptance_criteria.each_with_index.map { |crit, index| "#{index + 1}. #{crit.criterion}" }
        pdf.formatted_text_box [
            {:text => "Acceptance Criteria\n", :styles => [:bold]},
            {:text => acceptance_criteria.join("\n") }
          ],
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.65],
          :width => pdf.bounds.width * 0.9,
          :height => pdf.bounds.height * 0.6,
          :size => 14
      end

      @box_count = @box_count + 1

      # create a new page as we are out of pages
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

    # like box_offset above
    # however this method returns co-ordinates of the back page of a double sided page
    # i.e. horizontally mirrored
    # page 1 --- page 2
    # [1][0]    [0][1]
    # [3][2]    [3][2]
    def mirror_box_offset(x, y, box_position, page_size)
      new_box_position = case box_position.modulo(BOXES_PER_PAGE)
      when 0 then 1
      when 1 then 0
      when 2 then 3
      when 3 then 2
      end
      box_offset(x, y, new_box_position, page_size)
    end

    # set up the stsandard fields & bounding box for a card
    def standard_box_fields(story, pdf, box_offset, box_width, box_height, &block)
      pdf.bounding_box box_offset, :width => box_width, :height => box_height do
        pdf.text_box "Project: #{story.theme.backlog.name}",
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.9],
          :width => pdf.bounds.width * 0.65,
          :height => pdf.bounds.height * 0.1,
          :size => 14
        pdf.formatted_text_box [{:text => "#{story.theme.code}#{story.unique_id}", :styles => [:bold]}],
          :align => :right, :size => 16,
          :at => [pdf.bounds.width * 0.70, pdf.bounds.height * 0.9],
          :width => pdf.bounds.width/4,
          :height => pdf.bounds.height * 0.1
        pdf.text_box "Theme: #{story.theme.name}",
          :size => 15,
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.8],
          :width => pdf.bounds.width,
          :height => pdf.bounds.height * 0.1

        yield

        pdf.stroke do
          pdf.rectangle pdf.bounds.top_left, pdf.bounds.width, pdf.bounds.height
        end
      end
    end
end