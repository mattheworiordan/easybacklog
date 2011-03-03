App.Views.Stories = {
  Index: Backbone.View.extend({
    tagName: 'div',
    className: 'stories',
    childId: function(model) { return 'story-' + model.get('id') },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['stories/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Stories.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      })

      return(this);
    }
  }),

  Show: Backbone.View.extend({
    tagName: 'li',
    className: 'story',

    events: {
      "click": "click"
    },

    initialize: function() {
      this.model = this.options.model;
    },

    render: function() {
      $(this.el).html( JST['stories/show']({ model: this.model }) );
      var view = new App.Views.AcceptanceCriteria.Index({ collection: this.model.AcceptanceCriteria() });
      $(this.el).append(view.render().el);
      return (this);
    },

    click: function() {
      alert ('Story clicked ' + this.model.get('id'));
    }
  })
};