App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",
    childId: function(model) { return 'theme-' + model.get('id') },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['themes/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Themes.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      })

      return(this);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'theme',

    events: {
      "click": "click"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      this.$('>.stories').html(view.render().el);

      // fix the widths of the DIVs to exactly the widths of the table headers as they fall out of alignment
      var show_view = this;
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
    click: function() {
      // alert ('Theme clicked ' + this.model.get('id'));
    }
  })
};