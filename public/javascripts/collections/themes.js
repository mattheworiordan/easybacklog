var ThemesCollection = Backbone.Collection.extend({
  model: Theme,
  backlog_id: null,

  url: function() {
    if (!this.backlog_id) {
      new App.View.Error('Error, missing necesary ID to display Theme');
    } else {
      return '/backlogs/' + this.backlog_id + '/themes';
    }
  },

  initialize: function(models, options) {
    this.backlog_id = options ? options.backlog_id : null;
  }
});