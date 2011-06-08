var AcceptanceCriterion = Backbone.Model.extend({
  Story: function() {
    return this.collection.story;
  },

  // editable if no snapshot master
  IsEditable: function() {
    return (this.collection.story.IsEditable());
  },

  // a method callback invoked only by App.Views.BaseView
  beforeSave: function(callback) {
    if (this.collection.story.isNew()) {
      window.console && console.log('Saving parent Story first');
      this.collection.story.save({}, {
        error: function(model, response) {
          var errorMessage = 'Unable to save changes...  Please refresh.'
          try {
            errorMessage = eval('responseText = ' + response.responseText).message;
          } catch (e) { window.console && console.log(e); }
          new App.Views.Error({ message: errorMessage});
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