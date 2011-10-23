/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var SprintStory = Backbone.Model.extend({
  Sprint: function() {
    return this.collection.sprint;
  },

  Story: function() {
    if (!this._story) {
      this._story = this.Sprint().Backlog().Themes().get(this.get('theme_id')).Stories().get(this.get('story_id'));
      if (!this._story) {
        throw "Data inconsistency error, story " + this.get('story_id') + " does not exist"
      }
    }
    return this._story;
  }
});