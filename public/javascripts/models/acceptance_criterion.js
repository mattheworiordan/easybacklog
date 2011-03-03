var AcceptanceCriterion = Backbone.Model.extend({
  Story: function() {
    return this.collection.story;
  }
});