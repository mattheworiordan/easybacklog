var Theme = Backbone.Model.extend({
  initialize: function() {},

  // access to stories child collection
  Stories: function() {
    if (this._stories == null) {
      this._stories = new StoriesCollection(this.get('stories'), { theme: this });
    }
    return (this._stories);
  },

  Backlog_ID: function() {
    return this.collection.backlog_id;
  }
});