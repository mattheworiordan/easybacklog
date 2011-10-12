/*global Backbone:false, $:false, _:false, JST:false, Sprint:false, App:false */

var SprintsCollection = Backbone.Collection.extend({
  model: Sprint,
  backlog_id: null,

  url: function() {
    if (!this.backlog_id) {
      var errorView = new App.Views.Error('Error, missing necessary Backlog ID to display Sprint');
    } else {
      return '/backlogs/' + this.account_id + '/sprints';
    }
  },

  initialize: function(models, options) {
    this.backlog_id = options ? options.backlog_id : null;
  }
});