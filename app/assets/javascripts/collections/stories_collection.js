/*global Backbone:false, $:false, _:false, JST:false, Story:false, App:false */

var StoriesCollection = Backbone.Collection.extend({
  model: Story,
  theme: null,

  url: function() {
    if ( !this.theme || !this.theme.get('id') ) {
      var errorView = new App.Views.Error({ message: 'Error, missing necessary data ID to display Story' });
    } else {
      return '/themes/' + this.theme.get('id') + '/stories';
    }
  },

  initialize: function(models, options) {
    this.theme = options ? options.theme : null;
  },

  saveOrder: function(idOrderCollection, options) {
    var thisCollection = this;
    _.each(idOrderCollection, function(index, key) {
      var story = thisCollection.get(key);
      if (story) { // might not exist as not yet saved
        story.set({ 'position': idOrderCollection[key] });
        if (options && options.reloadStatistics) { story.set({ 'force_send_statistics': true }); } // allow stats to be force reloaded even if points has not changed
        story.save();
      }
    });
  }
});