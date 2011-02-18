# Be sure to restart your server when you modify this file.

# Add new inflection rules using the following format
# (all these examples are active by default):
#   inflect.plural /^(ox)$/i, '\1en'
#   inflect.singular /^(ox)en/i, '\1'
#   inflect.uncountable %w( fish sheep )

ActiveSupport::Inflector.inflections do |inflect|
  inflect.irregular 'criterion', 'criteria'
end
