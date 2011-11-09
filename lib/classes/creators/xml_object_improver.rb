# Refer to https://github.com/jordi/xml-object/issues/4 to see the issue XMLObject creates with collections
# This library helps to address that transparently

module Creators
  module XmlObjectImprover
    # if you call .length on a node collection with one or less nodes, it will return 0 and not return an iterator
    # this method addresses that by doing the following:
    # backlog.themes for 2+ child theme nodes returns backlog.themes which is enumerable
    # backlog.themes for 1 child is returned as backlog.themes.theme wrapped in an array
    # anything else is an empty array
    def arr(data, plural_node_name)
      if data.send(plural_node_name).respond_to? :each
        data.send(plural_node_name)
      else
        # data.criteria.respond_to? :criterion does not respond_to? weirdly,
        # however data.criteria.criterion returns a singular object
        [data.send(plural_node_name).send(plural_node_name.to_s.singularize.to_sym)] rescue []
      end
    end
  end
end