/*global Backbone:false, $:false, _:false, JST:false, AcceptanceCriterion:false, App:false */

var AcceptanceCriteriaCollection = Backbone.Collection.extend({
  model: AcceptanceCriterion,
  story: null,

  url: function() {
    if ( !this.story || !this.story.get('id') ) {
      var errorView = new App.Views.Error('Error, missing necessary data ID to display Acceptance Criteria');
    } else {
      return '/stories/' + this.story.get('id') + '/acceptance_criteria';
    }
  },

  initialize: function(models, options) {
    this.story = options ? options.story : null;
    _.bindAll(this, 'saveOrder');
  },

  saveOrder: function(idOrderCollection) {
    var thisCollection = this;
    _.each(idOrderCollection, function(index, key) {
      var criterion = thisCollection.get(key);
      if (criterion) { // might not exist as not yet saved
        criterion.set({ 'position': idOrderCollection[key] });
        criterion.save();
      }
    });
  }
});