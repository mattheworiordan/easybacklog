var AcceptanceCriteriaCollection = Backbone.Collection.extend({
  model: AcceptanceCriterion,
  story: null,

  url: function() {
    if ( !this.story || !this.story.get('id') ) {
      new App.View.Error('Error, missing necessary data ID to display Acceptance Criteria');
    } else {
      return '/stories/' + this.story.get('id') + '/acceptance_criteria';
    }
  },

  initialize: function(models, options) {
    this.story = options ? options.story : null;
  }
});