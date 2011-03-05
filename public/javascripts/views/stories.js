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
      this.beforeChangeValue = {};
      _.bindAll(this, 'beforeChange', 'contentUpdated');
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
      var defaultOptions = { onblur: 'submit', tooltip: 'Click to edit', data: beforeChangeFunc };

      this.$('>div.unique-id div, >div.score-50 div, >div.score-90 div').editable( contentUpdatedFunc, _.extend(defaultOptions, {}) );
      this.$('>div.comments div, >div.user-story div div.data').editable( contentUpdatedFunc, _.extend(defaultOptions, { type: 'textarea' }) );
    },

    click: function() {
      // alert ('Story clicked ' + this.model.get('id'));
    },

    // keep track if field has changed as no need for server round trip if nothing has changed
    beforeChange: function(value, settings, target)
    {
      var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
      this.beforeChangeValue[fieldId] = value; // store value in elem
      console.log('Before - ' + this.id + ': ' + value + ' --> ' + fieldId);
      return (value);
    },

    contentUpdated: function(value, settings, target)
    {
      var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
      console.log('changed id: ' + fieldId);
      if (value != this.beforeChangeValue[fieldId]) {
        console.log('value for ' + fieldId + ' has changed from ' + this.beforeChangeValue[fieldId] + ' to ' + value);
        var attributes = {};
        attributes[fieldId] = value;
        console.log(this.model.get('i_want_to'));
        this.model.set(attributes);
        this.model.save();
      }
      return (value);
    }
  })
};