# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf
# Mime::Type.register_alias "text/html", :iphone
Mime::Type.register "application/msexcel", :xls

# specify TTF mime type at Rack level as Sprockets uses Rack to resolve mime types
Mime::Type.register "font/truetype", :ttf
Rack::Mime::MIME_TYPES[".ttf"] = "font/truetype"