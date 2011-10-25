/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var SprintStory = Backbone.Model.extend({
  Sprint: function() {
    return this.collection.sprint;
  },

  Story: function() {
    var that = this;
    if (!this._story) {
      var theme = this.Sprint().Backlog().Themes().get(this.get('theme_id'));
      if (!theme) {
        // theme_id may not have been cached from the server due to delay in network comms, so let's just find the slow way
        this.Sprint().Backlog().Themes().each(function(theme) {
          if (!that._story) {
            var story = theme.Stories().get(that.get('story_id'));
            if (story) {
              that._story = story;
            }
          }
        });
      } else {
        this._story = theme.Stories().get(this.get('story_id'));
      }
      if (!this._story) {
        throw "Data inconsistency error, story " + this.get('story_id') + " does not exist"
      }
    }
    return this._story;
  }
});