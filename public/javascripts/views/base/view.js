App.Views.BaseView = Backbone.View.extend({
  defaultEditableOptions: {
    onblur: 'submit',
    tooltip: 'Click to edit',
    placeholder: '[edit]',
    lesswidth: 5,
    type: 'text'
  },

  initialize: function() {
    this.model = this.options.model;
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
  beforeChange: function(value, settings, target)
  {
    var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
    this.beforeChangeValue[fieldId] = value;
    return (value);
  },

  // if a value has been updated, update the model and save to the server
  contentUpdated: function(value, settings, target)
  {
    var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
    var fieldWithValue = $(target);
    var beforeChangeValue = this.beforeChangeValue[fieldId];

    if (value != beforeChangeValue) {
      console.log('value for ' + fieldId + ' has changed from ' + this.beforeChangeValue[fieldId] + ' to ' + value);
      var attributes = {};
      attributes[fieldId] = value;
      this.model.set(attributes);

      // create a callback to this save function as if the mode has beforeSave function we call that first
      // this is used whereby a parent model is not yet saved and needs to be first i.e. criterion added to unsaved story
      var this_model = this.model;
      var saveModelFunc = function() {
        this_model.save({}, {
          error: function(model, response) {
            var errorMessage = 'Unable to save changes...'
            try {
              errorMessage = eval('responseText = ' + response.responseText).message;
            } catch (e) { console.log(e); }
            new App.Views.Error({ message: errorMessage});
            fieldWithValue.text(_.isEmpty(beforeChangeValue) ? '[edit]' : beforeChangeValue);
          }
        });
      }
      if (this.model.beforeSave) {
        this.model.beforeSave(saveModelFunc);
      } else {
        saveModelFunc();
      }
    }
    return (value);
  },

  // handle user clicking to remove object
  remove: function() {
    event.preventDefault();
    var view = this;

    if (view.model.isNew()) { // not saved to server yet
      view.model.collection.remove(view.model);
      $(view.el).remove(); // remove HTML for story
    } else {
      $(this.deleteDialogSelector).dialog({
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