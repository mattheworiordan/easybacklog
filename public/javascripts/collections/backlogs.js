var BacklogsCollection = Backbone.Collection.extend({
  model: Backlog,
  company_id: null,

  url: function() {
    if (!this.company_id) {
      new App.Views.Error('Error, missing necesary ID to display Backlog');
    } else {
      return '/companies/' + this.company_id + '/backlogs';
    }
  },

  initialize: function(models, options) {
    this.company_id = options ? options.company_id : null;
  }
});