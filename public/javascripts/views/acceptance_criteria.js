App.Views.AcceptanceCriteria = {
  Index: Backbone.View.extend({
    tagName: 'div',
    className: 'acceptance-criteria',
    childId: function(model) { return 'acceptance-criteria-' + model.get('id') },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['acceptance_criteria/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.AcceptanceCriteria.Show({ model: model, id: parentView.childId(model) });
        parentView.$('ul').append(view.render().el);
      })

      return(this);
    }
  }),

  Show: Backbone.View.extend({
    tagName: 'li',
    className: 'acceptance-criteria',

    events: {
      "click": "click"
    },

    initialize: function() {
      this.model = this.options.model;
    },

    render: function() {
      $(this.el).html( JST['acceptance_criteria/show']({ model: this.model }) );
      $(this.el).editable();
      return (this);
    },

    click: function() {
      // alert ('Acceptance criteria clicked ' + this.model.get('id'));
    }
  })
};