/*global Backbone:false, $:false, _:false, JST:false, Theme:false, App:false */

var ThemesCollection = Backbone.Collection.extend({
  model: Theme,
  backlog: null,

  url: function() {
    if (!this.backlog) {
      var errorView = new App.Views.Error('Error, cannot find Backlog and thus cannot load Theme');
    } else {
      return '/backlogs/' + this.backlog.get('id') + '/themes';
    }
  },

  initialize: function(models, options) {
    this.backlog = options ? options.backlog : null;
  },

  saveOrder: function(idOrderCollection) {
    var thisCollection = this;
    _.each(idOrderCollection, function(index, key) {
      var theme = thisCollection.get(key);
      if (theme) { // might not exist as not yet saved
        theme.set({ 'position': idOrderCollection[key] });
        theme.save();
      }
    });
  }
});