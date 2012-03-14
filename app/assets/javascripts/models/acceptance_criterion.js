/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var AcceptanceCriterion = Backbone.Model.extend({
  Story: function() {
    return this.collection.story;
  },

  // editable if no snapshot master
  IsEditable: function() {
    return this.CanEdit();
  },

  IsLocked: function() {
    return this.collection.story.IsLocked();
  },

  CanEdit: function() {
    return this.collection.story.CanEdit();
  },

  CanEditStatus: function() {
    return this.collection.story.CanEditStatus();
  },

  IsAccepted: function() {
    return (this.collection.story.IsAccepted());
  },

  // a method callback invoked only by App.Views.BaseView
  beforeSave: function(callback) {
    if (this.collection.story.isNew()) {
      if (window.console) { console.log('Saving parent Story first'); }
      this.collection.story.save({}, {
        error: function(model, response) {
          var errorMessage = 'Unable to save changes...  Please refresh.';
          try {
            errorMessage = $.parseJSON(response.responseText).message;
          } catch (e) { if (window.console) { console.log(e); } }
          var errorView = new App.Views.Error({ message: errorMessage});
        },
        success: function() {
          callback();
        }
      });
    } else {
      callback();
    }
  }
});