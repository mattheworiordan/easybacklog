App.Views.Stories = {
  List: Backbone.View.extend({
    initialize: function() {
      this.collection = this.options.collection;
      this.el = $('#theme-' + this.collection.theme.get('id') + ' ul.stories');
      this.render();
      // alert ($(this.el).length + ' - ' + this.model.get('id'));
    },

    render: function() {
      var el = this.el;
      this.collection.each(function(story) {
        var view = new App.Views.Stories.Show({ model: story })
        el.append(view.render().el);
      });
    }
  }),

  Show: Backbone.View.extend({
    tagName: 'li',
    className: 'story',
    id: null,
    model: null,

    events: {
      "click": "click"
    },

    initialize: function() {
      this.model = this.options.model;
      this.id = this.model.get('id');
      alert (this.model.get('id'));
    },

    render: function() {
      $(this.el).html( JST['stories/show']({ model: this.model }) );
      return (this);
    },

    click: function() {
      alert ('click');
    }
  })
};