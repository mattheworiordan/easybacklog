/*global Backbone:false, $:false, _:false, JST:false, Backlog:false, App:false */

var BacklogsCollection = Backbone.Collection.extend({
  model: Backlog,
  account_id: null,

  url: function() {
    if (!this.account_id) {
      var errorView = new App.Views.Error('Error, missing necessary Account ID to display Backlog');
    } else {
      return '/accounts/' + this.account_id + '/backlogs';
    }
  },

  initialize: function(models, options) {
    this.account_id = options ? options.account_id : null;
  }
});