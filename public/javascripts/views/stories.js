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
      this.$('.acceptance-criteria').html(view.render().el);
      var show_view = this;
      $.each(['id','user-story','acceptance-criteria','comments','score-50','score-90'], function(elem, val) {
        show_view.$('>div.' + val).css('width', $('table th.' + val).outerWidth());
        if (val != 'acceptance-criteria') { show_view.$('>div.' + val).find('div').editable(); };
      });
      return (this);
    },

    click: function() {
      // alert ('Story clicked ' + this.model.get('id'));
    }
  })
};