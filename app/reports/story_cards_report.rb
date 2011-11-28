class StoryCardsReport
  BOXES_PER_PAGE = 4
  PAGE_SIZES = {
    :A4 => OpenStruct.new(:width => 841.89, :height => 595.28, :margin_x => 30, :margin_y => 30),
    :LETTER => OpenStruct.new(:width => 792.00, :height => 612.00, :margin_x => 30, :margin_y => 30)
  }

  # Create a PDF report of the themes passed in
  #  page_size = A4 (default) | LETTER
  #  fold_side = short | long (default)
  def to_pdf(stories, page_size, fold_side)
    page_size = 'A4' unless (PAGE_SIZES.has_key?((page_size || '').to_sym))
    fold_side = 'short' unless %w(short long).include?(fold_side)
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

    stories.each do |story|
      add_story(pdf, document_options, page_size, fold_side, story)
    end

    pdf.render
  end

  private
    def add_story(pdf, document_options, page_size, fold_side, story)
      page_dimensions = PAGE_SIZES[page_size.to_sym]
      card_width = (page_dimensions.width - page_dimensions.margin_x*2)/2
      card_height = (page_dimensions.height - page_dimensions.margin_y*2)/2

      # create a new page as we are out of pages
      pdf.start_new_page(document_options) if (@box_count.modulo(BOXES_PER_PAGE) == 0) && (@box_count > 0)

      # create the reverse page if on first box
      pdf.start_new_page(document_options) if (@box_count.modulo(BOXES_PER_PAGE) == 0)

      # let's work on the first page
      pdf.go_to_page pdf.page_count-1

      offset = box_offset(0.05, 0.95, @box_count, page_size)
      standard_box_fields(story, pdf, offset, card_width*0.9, card_height*0.9) do
        pdf.text_box "#{I18n.t 'backlog.backlog', :default => 'Backlog'}: #{story.theme.backlog.name}",
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.93],
          :width => pdf.bounds.width * 0.65,
          :height => pdf.bounds.height * 0.1,
          :size => 14
        pdf.text_box "#{I18n.t 'backlog.theme', :default => 'Theme'}: #{story.theme.name}",
          :size => 15,
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.83],
          :width => pdf.bounds.width,
          :height => pdf.bounds.height * 0.1
        pdf.formatted_text_box [
            {:text => "#{I18n.t 'backlog.as_a', :default => 'As'} ", :color => '666666'}, {:text => "#{story.as_a}", :styles => [:bold]},
            {:text => "\n#{I18n.t 'backlog.i_want_to', :default => 'I want to'} ", :color => '666666'}, {:text => "#{story.i_want_to}", :styles => [:bold]},
            {:text => "\n#{I18n.t 'backlog.so_i_can', :default => 'So I can'} ", :color => '666666'}, {:text => "#{story.so_i_can}", :styles => [:bold]}
          ],
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.65],
          :width => pdf.bounds.width * 0.9,
          :height => pdf.bounds.height * 0.6,
          :size => 20,
          :overflow => :shrink_to_fit
        pdf.stroke do
          pdf.line [0, pdf.bounds.height * 0.7], [pdf.bounds.width, pdf.bounds.height * 0.7]
        end
      end

      # let's work on the first page where everything other than acceptance criteria are shown
      pdf.go_to_page pdf.page_count

      offset = mirror_box_offset(0.05, 0.95, @box_count, page_size, fold_side)
      standard_box_fields(story, pdf, offset, card_width*0.9, card_height*0.9) do
        acceptance_criteria = story.acceptance_criteria.each_with_index.map { |crit, index| "#{index + 1}. #{crit.criterion}" }
        pdf.formatted_text_box [
            {:text => "#{I18n.t 'backlog.acceptance_criteria', :default => 'Acceptance Criteria'}\n", :styles => [:bold], :size => 16},
            {:text => "\n", :size => 6},
            {:text => acceptance_criteria.join("\n") }
          ],
          :at => [pdf.bounds.width * 0.05, pdf.bounds.height * 0.93],
          :width => pdf.bounds.width * 0.9,
          :height => pdf.bounds.height * 0.86,
          :size => 15,
          :overflow => :shrink_to_fit
      end

      @box_count = @box_count + 1
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
      [offset[0] + x.to_f * card_width, offset[1] + y.to_f * card_height]
    end

    # Like box_offset above, however this method returns
    # co-ordinates of the back page of a double sided page
    # based on the fold side (short or long)
    # Note: All layouts below based on landscape format
    #
    # Short side mirroring as follows (mirrored across horizontally)
    # page 1 --- page 2
    # [0][1]  [1][0]
    # [2][3]  [3][2]
    #
    # Long side mirroring as follows (mirrored across horizontally)
    # page 1 --- page 2
    # [0][1]  [2][3]
    # [2][3]  [0][1]
    def mirror_box_offset(x, y, box_position, page_size, fold_side)
      new_box_position = if fold_side == 'short'
        # short side fold
        case box_position.modulo(BOXES_PER_PAGE)
          when 0 then 1
          when 1 then 0
          when 2 then 3
          when 3 then 2
        end
      else
        # long side fold
        case box_position.modulo(BOXES_PER_PAGE)
          when 0 then 2
          when 1 then 3
          when 2 then 0
          when 3 then 1
        end
      end
      box_offset(x, y, new_box_position, page_size)
    end

    # set up the stsandard fields & bounding box for a card
    def standard_box_fields(story, pdf, box_offset, box_width, box_height, &block)
      pdf.bounding_box box_offset, :width => box_width, :height => box_height do
        pdf.formatted_text_box [{:text => "#{story.theme.code}#{story.unique_id}", :styles => [:bold], :color => 'FF0000'}],
          :align => :right, :size => 16,
          :at => [pdf.bounds.width * 0.70, pdf.bounds.height * 0.93],
          :width => pdf.bounds.width/4,
          :height => pdf.bounds.height * 0.1

        yield

        pdf.stroke do
          pdf.rectangle pdf.bounds.top_left, pdf.bounds.width, pdf.bounds.height
        end
      end
    end
end