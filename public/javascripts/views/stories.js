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
    deleteDialogSelector: '#dialog-delete-story',

    events: {
      "click div.acceptance-criteria ul.acceptance-criteria .actions a.new-acceptance-criterion": "newAcceptanceCriterion",
      "click .delete-story>a": "delete"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);

      _.bindAll(this, 'changeEvent');
      var changeEvent = this.changeEvent;
      // if anything happens to the model pass on a change event
      this.model.bind('all', function(eventName) { changeEvent(eventName, this); });
    },

    render: function() {
      $(this.el).html( JST['stories/show']({ model: this.model }) );

      var view = new App.Views.AcceptanceCriteria.Index({ collection: this.model.AcceptanceCriteria() });
      this.$('.acceptance-criteria').html(view.render().el);
      this.$('.acceptance-criteria ul.acceptance-criteria').append(JST['acceptance_criteria/new']());

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

      this.$('>div.unique-id .data, >div.score-50 .data, >div.score-90 .data').editable(contentUpdatedFunc, defaultOptions);
      this.$('>div.comments .data, >div.user-story div .data').editable(contentUpdatedFunc,
        _.extend(defaultOptions, { type: 'textarea', saveonenterkeypress: true } ));
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
      }
    },

    newAcceptanceCriterion: function() {
      event.preventDefault();
      var model = new AcceptanceCriterion();
      this.model.AcceptanceCriteria().add(model);
      var newElem = new App.Views.AcceptanceCriteria.Show({ model: model}).render().el;
      this.$('ul.acceptance-criteria li:last').before(newElem);
      $(newElem).find('.data').click(); // put focus onto new added element
    },

    deleteAction: function(dialog_obj, view) {
      var model_collection = view.model.collection;

      // tell the user we're deleting as it may take a second
      $(dialog_obj).find('>p').html('Deleting story...<br />Please wait.');
      $(dialog_obj).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Close');
      $(dialog_obj).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
      view.model.destroy({
        error: function(model, response) {
          var errorMessage = 'Unable to delete story...'
          try {
            errorMessage = eval('responseText = ' + response.responseText).message;
          } catch (e) { console.log(e); }
          new App.Views.Error({ message: errorMessage});
          $(dialog_obj).dialog("close"); // hide the dialog
        },
        success: function(model, response) {
          model_collection.remove(view.model);
          $(view.el).remove(); // remove HTML for story
          $(dialog_obj).dialog("close"); // hide the dialog
        }
      });
    }
  })
};