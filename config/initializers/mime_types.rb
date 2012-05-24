# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf
# Mime::Type.register_alias "text/html", :iphone
Mime::Type.register "application/msexcel", :xls

# specify TTF mime type at Rack level as Sprockets uses Rack to resolve mime types
Mime::Type.register "font/truetype", :ttf
Rack::Mime::MIME_TYPES[".ttf"] = "font/truetype"

# custom mime types for API requests
Mime::Type.unregister :json
Mime::Type.register 'application/json', :json, ['application/json', 'application/vnd.easybacklog+json', 'application/vnd.easybacklog+json; version=1.0', 'text/json', 'text/x-json', 'application/jsonrequest']
Mime::Type.unregister :xml
Mime::Type.register "application/xml", :xml, ['application/xml', 'application/vnd.easybacklog+xml', 'application/vnd.easybacklog+xml; version=1.0', 'text/xml', 'application/x-xml']
Mime::Type.unregister :pdf
Mime::Type.register "application/pdf", :pdf, ['application/pdf', 'application/vnd.easybacklog+pdf', 'application/vnd.easybacklog+pdf; version=1.0']
Mime::Type.unregister :xls
Mime::Type.register "application/vnd.ms-excel", :xls, ['application/vnd.ms-excel', 'application/vnd.easybacklog+xls', 'application/vnd.easybacklog+xls; version=1.0']