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
  }
});