var ThemesCollection = Backbone.Collection.extend({
  model: Theme,
  backlog: null,

  url: function() {
    if (!this.backlog) {
      new App.View.Error('Error, cannot find Backlog and thus cannot load Theme');
    } else {
      return '/backlogs/' + this.backlog.get('id') + '/themes';
    }
  },

  initialize: function(models, options) {
    this.backlog = options ? options.backlog : null;
  }
});