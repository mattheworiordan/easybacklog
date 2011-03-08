/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",
    childId: function(model) { return 'theme-' + model.get('id'); },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['themes/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Themes.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      });

      return(this);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'theme',
    deleteDialogSelector: '#dialog-delete-theme',

    events: {
      "click div.stories ul.stories .actions a.new-story": "newStory",
      "click .delete-theme>a": "delete"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);

      _.bindAll(this, 'changeEvent');
      var changeEvent = this.changeEvent;
      // if anything happens to the model pass on a change event
      this.model.bind('all', function(eventName) { changeEvent(eventName, this); });
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      this.$('>.stories').html(view.render().el);

      var show_view = this;

      this.$('>.stories ul.stories').append(JST['stories/new']());

      // fix the widths of the DIVs to exactly the widths of the table headers as they fall out of alignment
      show_view.$('>.name').css('width', $('table th.theme').outerWidth());

      this.makeFieldsEditable();
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(this.defaultEditableOptions, { data: beforeChangeFunc });

      this.$('>.name div.data').editable(contentUpdatedFunc, defaultOptions);
    },

    newStory: function() {
      event.preventDefault();
      var model = new Story();
      this.model.Stories().add(model);
      this.$('>.stories ul.stories li:last').before(new App.Views.Stories.Show({ model: model}).render().el);
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
      }
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