/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, StoriesCollection:false */

var Theme = Backbone.Model.extend({
  // access to stories child collection
  Stories: function() {
    if (!this._stories) {
      this._stories = new StoriesCollection(this.get('stories'), { theme: this });
      this.unset('stories'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._stories);
  },

  Backlog: function() {
    return this.collection.backlog;
  },

  // editable if no snapshot master
  IsEditable: function() {
    return (this.collection.backlog.IsEditable());
  },

  // renumber all the stories by assigning them sequential IDs
  ReNumberStories: function(options) {
    var theme = this;
    $.post(this.collection.url() + '/' + this.get('id') + '/re-number-stories').success(function(ajaxResult, status, response) {
      theme.Stories().each(function(story) {
        story.fetch();
      });
      if (_.isFunction(options.success)) {
        // callback for success
        options.success(theme, response);
      }
    }).error(function(event, response) {
      if (window.console) { console.log('Renumber stories failed'); }
      if (_.isFunction(options.error)) {
        // callback for error
        options.error(theme, response);
      }
    });
  }
});