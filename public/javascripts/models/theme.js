var Theme = Backbone.Model.extend({
  // access to stories child collection
  Stories: function() {
    if (this._stories == null) {
      this._stories = new StoriesCollection(this.get('stories'), { theme: this });
      this.unset('stories'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._stories);
  },

  Backlog: function() {
    return this.collection.backlog;
  }
});