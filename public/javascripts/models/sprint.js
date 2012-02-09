/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var Sprint = Backbone.Model.extend({
  Backlog: function() {
    return this.collection.backlog;
  },

  SprintStories: function() {
    if (!this._sprint_stories) {
      this._sprint_stories = new SprintStoriesCollection(this.get('sprint_stories'), { sprint: this });
      this.unset('sprint_stories'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._sprint_stories);
  },

  IsComplete: function() {
    return this.get('completed?');
  },

  IsEditable: function() {
    if (this.IsComplete()) {
      return false;
    } else {
      return this.CanEdit();
    }
  },

  CanEdit: function() {
    return this.collection.backlog.CanEdit();
  },

  CanEditStatus: function() {
    return (this.collection.backlog.CanEditStatus());
  }
});