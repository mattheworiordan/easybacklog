var StoriesCollection = Backbone.Collection.extend({
  model: Story,
  theme: null,

  url: function() {
    if ( !this.theme || !this.theme.get('id') ) {
      new App.Views.Error('Error, missing necessary data ID to display Story');
    } else {
      return '/themes/' + this.theme.get('id') + '/stories';
    }
  },

  initialize: function(models, options) {
    this.theme = options ? options.theme : null;
  },

  saveOrder: function(idOrderCollection) {
    var thisCollection = this;
    _.each(idOrderCollection, function(index, key) {
      var story = thisCollection.get(key);
      if (story) { // might not exist as not yet saved
        story.set({ 'position': idOrderCollection[key] });
        story.save();
      }
    });
  }
});