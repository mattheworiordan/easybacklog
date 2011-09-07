module PDF
  class PdfToText
    def initialize(pdf_file)
      @receiver = PDF::SimplePageTextReceiver.new
      pdf = PDF::Reader.file(pdf_file, @receiver)
    end

    def get_text
      @receiver.content.inspect
    end
  end
end