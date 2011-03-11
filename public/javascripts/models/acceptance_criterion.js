var AcceptanceCriterion = Backbone.Model.extend({
  Story: function() {
    return this.collection.story;
  },

  // a method callback invoked only by App.Views.BaseView
  beforeSave: function(callback) {
    if (this.collection.story.isNew()) {
      console.log('Saving parent Story first');
      this.collection.story.save({}, {
        error: function(model, response) {
          var errorMessage = 'Unable to save changes...  Please refresh.'
          try {
            errorMessage = eval('responseText = ' + response.responseText).message;
          } catch (e) { console.log(e); }
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