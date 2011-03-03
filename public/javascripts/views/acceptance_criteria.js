App.Views.AcceptanceCriteria = {
  List: Backbone.View.extend({
    initialize: function() {
      this.collection = this.options.collection;
      this.render();
    },

    render: function() {
      var el = this.el;
      this.collection.each(function(acceptanceCriteria) {
        var view = new App.Views.AcceptanceCriteria.Show({ model: acceptanceCriteria })
        el.append(view.render().el);
      });
    }
  }),

  Show: Backbone.View.extend({
    tagName: 'li',
    className: 'acceptance-criteria',
    id: null,
    model: null,

    events: {
      "click": "click"
    },

    initialize: function() {
      this.model = this.options.model;
      this.id = this.model.get('id');
    },

    render: function() {
      $(this.el).html( JST['acceptance_criteria/show']({ model: this.model }) );
      return (this);
    },

    click: function() {
      alert ('click acceptance criteria');
    }
  })
};