/*global Backbone:false, $:false, _:false, JST:false, Story:false, App:false */

var SprintStoriesCollection = Backbone.Collection.extend({
  model: SprintStory,
  sprint: null,

  url: function() {
    if (!this.sprint) {
      var errorView = new App.Views.Error({ message: 'Error, cannot find Sprint and thus cannot load SprintStory' });
    } else {
      return '/sprints/' + this.sprint.get('id') + '/sprint-stories';
    }
  },

  initialize: function(models, options) {
    this.sprint = options ? options.sprint : null;
  }
});