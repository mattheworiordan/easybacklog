/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

App.Views.BaseView = Backbone.View.extend({
  defaultEditableOptions: {
    placeHolder: '<span class="editable-blank">[edit]</span>',
    type: 'text',
    zIndex: 3 /* header is 5+, content is 1 */
  },

  initialize: function() {
    this.model = this.options.model;
    this.parentView = this.options.parentView; // sometimes need a reference to the parent
    this.beforeChangeValue = {};
    _.bindAll(this, 'beforeChange', 'contentUpdated'); // obligatory methods if inherit from base

    if (this.changeEvent) {
      _.bindAll(this, 'changeEvent');
      var changeEvent = this.changeEvent;
      // if anything happens to the model pass on a change event
      this.model.bind('all', function(eventName) { changeEvent(eventName, this); });
    }

    if (this.updateStatistics) {
      _.bindAll(this, 'updateStatistics');
      this.model.bind('statisticsUpdated', this.updateStatistics);
    }
  },

  // keep track if field has changed as no need for server round trip if nothing has changed
  beforeChange: function(value, target)
  {
    var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
    this.beforeChangeValue[fieldId] = value;
    return (value);
  },

  // if a value has been updated, update the model and save to the server
  contentUpdated: function(value, target)
  {
    var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
    var fieldWithValue = $(target);
    var beforeChangeValue = this.beforeChangeValue[fieldId];
    var view = this;

    if (value != beforeChangeValue) {
      var attributes = {};
      attributes[fieldId] = value;
      this.model.set(attributes);

      // create a callback to this save function as if the mode has beforeSave function we call that first
      // this is used whereby a parent model is not yet saved and needs to be first i.e. criterion added to unsaved story
      var this_model = this.model;
      var saveModelFunc = function() {
        this_model.save({}, {
          error: function(model, response) {
            var errorMessage = 'Unable to save changes...';
            try {
              errorMessage = $.parseJSON(response.responseText).message;
              if (errorMessage.match(/^Score 50(.*), Score 90(?:\1)$/)) {
                errorMessage = 'Score ' + errorMessage.match(/^Score 50(.*), Score 90(?:\1)$/)[1];
              }
            } catch (e) { if(window.console) { console.log(e); } }
            var errorView = new App.Views.Error({ message: errorMessage});
            // exception to deal with unique-id showing code from parent model in value
            fieldWithValue.html(_.isEmpty(beforeChangeValue) ? view.defaultEditableOptions.placeHolder : multiLineHtmlEncode(beforeChangeValue));
            var valBack = {};
            valBack[fieldId] = _.isEmpty(beforeChangeValue) ? null : beforeChangeValue;
            this_model.set(valBack); // reset model value back as well
            if (fieldId == 'code') { // Theme: code has reverted so update code to old code in all children stories
              view.model.Stories().each(function(story, index) {
                story.trigger('change:unique_id'); // trigger unique ID change so field is updated
              });
            }
          }
        });
      };
      // allow an event to be fired before saving the model to allow for any last minute changes
      if (this.model.beforeSave) {
        this.model.beforeSave(saveModelFunc);
      } else {
        saveModelFunc();
      }
    }
    return (value);
  },

  // handle user clicking to remove object
  remove: function(event) {
    event.preventDefault();
    var view = this;

    if (view.model.isNew()) { // not saved to server yet
      view.model.collection.remove(view.model);
      // remove HTML for story, had to animate & delay, some strange issue where page was reloading
      $(view.el).slideUp('fast', function() { $(view.el).remove(); });
    } else {
      $('#dialog-delete').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST[this.deleteDialogTemplate]({ model: this.model }));
      $('#dialog-delete').dialog({
        resizable: false,
        height:170,
        modal: true,
        buttons: {
          Delete: function() {
            view.deleteAction(this, view);
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    }
    return (false);
  }
});