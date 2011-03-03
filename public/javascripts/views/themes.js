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

  Show: Backbone.View.extend({
    tagName: 'li',
    className: 'theme',

    events: {
      "click": "click"
    },

    initialize: function() {
      this.model = this.options.model;
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      $(this.el).append(view.render().el);
      this.$('.theme div').editable();
      return (this);
    },

    click: function() {
      // alert ('Theme clicked ' + this.model.get('id'));
    }
  })
};