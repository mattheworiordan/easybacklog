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

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'criterion',

    events: {
      "click": "click"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
    },

    render: function() {
      $(this.el).html( JST['acceptance_criteria/show']({ model: this.model }) );

      this.makeFieldsEditable();
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(this.defaultEditableOptions, { data: beforeChangeFunc });

      $(this.el).find('>div').editable(contentUpdatedFunc, defaultOptions);
    },

    click: function() {
      // alert ('Acceptance criteria clicked ' + this.model.get('id'));
    }
  })
};