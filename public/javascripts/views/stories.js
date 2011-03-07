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

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'story',

    events: {
      // "click": "click"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'changeEvent');
      var changeEvent = this.changeEvent;
      this.model.bind('all', function(eventName) { changeEvent(eventName, this); });
    },

    render: function() {
      $(this.el).html( JST['stories/show']({ model: this.model }) );
      var view = new App.Views.AcceptanceCriteria.Index({ collection: this.model.AcceptanceCriteria() });
      this.$('.acceptance-criteria').html(view.render().el);

      // fix the widths of the DIVs to exactly the widths of the table headers as they fall out of alignment
      var show_view = this;
      $.each(['unique-id','user-story','acceptance-criteria','comments','score-50','score-90'], function(elem, val) {
        show_view.$('>div.' + val).css('width', $('table th.' + val).outerWidth());
      });

      this.makeFieldsEditable();
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(this.defaultEditableOptions, { data: beforeChangeFunc });

      this.$('>div.unique-id div, >div.score-50 div, >div.score-90 div').editable(contentUpdatedFunc, defaultOptions);
      this.$('>div.comments div, >div.user-story div div.data').editable(contentUpdatedFunc,
        _.extend(defaultOptions, { type: 'textarea', saveonenterkeypress: true } ));
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').html(this.model.get(fieldChanged));
        console.log('Field changed: ' + fieldChanged);
      }
    }
  })
};