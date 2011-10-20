/*global Backbone:false, $:false, _:false, JST:false, Sprint:false, App:false */

var SprintsCollection = Backbone.Collection.extend({
  model: Sprint,
  backlog: null,

  url: function() {
    if (!this.backlog) {
      var errorView = new App.Views.Error({ message: 'Error, missing necessary Backlog ID to display Sprint' });
    } else {
      return '/backlogs/' + this.backlog.get('id') + '/sprints';
    }
  },

  initialize: function(models, options) {
    this.backlog = options ? options.backlog : null;
  }
});