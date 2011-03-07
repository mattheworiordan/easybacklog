/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",
    childId: function(model) { return 'theme-' + model.get('id'); },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['themes/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Themes.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      });

      return(this);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'theme',

    events: {
      "click div.stories ul.stories .actions a.new-story": "newStory"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      this.$('>.stories').html(view.render().el);

      var show_view = this;

      this.$('>.stories ul.stories').append(JST['stories/new']());

      // fix the widths of the DIVs to exactly the widths of the table headers as they fall out of alignment
      show_view.$('>.name').css('width', $('table th.theme').outerWidth());

      this.makeFieldsEditable();
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(this.defaultEditableOptions, { data: beforeChangeFunc });

      this.$('>.name div').editable(contentUpdatedFunc, defaultOptions);
    },

    newStory: function() {
      event.preventDefault();
      var model = new Story();
      this.model.Stories().add(model);
      this.$('>.stories ul.stories li:last').before(new App.Views.Stories.Show({ model: model}).render().el);
    }
  })
};