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

  IsEditable: function() {
    return this.CanEdit();
  },

  IsLocked: function() {
    return this.collection.backlog.IsLocked();
  },

  CanEdit: function() {
    return this.collection.backlog.CanEdit();
  },

  CanEditStatus: function() {
    return this.collection.backlog.CanEditStatus();
  },

  // renumber all the stories by assigning them sequential IDs
  ReNumberStories: function(options) {
    var theme = this;
    $.post(this.collection.url() + '/' + this.get('id') + '/re-number-stories', null, null, 'json').success(function(response) {
      theme.Stories().each(function(story) {
        story.fetch();
      });
      if (options && _.isFunction(options.success)) {
        // callback for success
        options.success(theme, response);
      }
    }).error(function(event) {
      if (window.console) { console.log('Renumber stories failed'); }
      if (options && _.isFunction(options.error)) {
        // callback for error
        options.error(event);
      }
    });
  },

  // used when a story is dragged between themes
  AddExistingStory: function(storyId, options) {
    var theme = this,
        story,
        stories,
        errorCallback = function(event) {
          if (window.console) { console.log('Add existing stories failed'); }
          if (options && _.isFunction(options.error)) {
            // callback for error
            options.error(event);
          }
        };

    $.post(this.collection.url() + '/' + this.get('id') + '/add-existing-story/' + storyId, null, null, 'json').success(function(response) {
      // find the story within the themes
      stories = theme.Backlog().Themes().map(function(theme) {
        return theme.Stories().get(Number(storyId));
      });
      story = _.compact(stories)[0];

      // move the story out of the old theme and into the new collection models
      story.set({ theme_id: theme.get('id') });
      story.Theme().Stories().remove(story, { silent: true });
      theme.Stories().add(story, { silent: true });

      // now get the latest version of this model from the server before we call the success callback
      // as this model needs to have the new ID assigned to it from the server
      story.fetch({
        success: function() {
          if (options && _.isFunction(options.success)) {
            // callback for success
            options.success(theme, response);
          }
        },
        error: errorCallback
      }); // update the story

    }).error(errorCallback);
  },

  MoveToBacklog: function(backlogId, options) {
    var theme = this;
    $.post(this.collection.url() + '/' + this.get('id') + '/move-to-backlog/' + backlogId, null, null, 'json').success(function(response) {
      theme.Backlog().Themes().remove(theme);
      if (options && _.isFunction(options.success)) {
        // callback for success
        options.success(theme, response);
      }
    }).error(function(event) {
      if (window.console) { console.log('Move theme to backlog failed'); }
      if (options && _.isFunction(options.error)) {
        // callback for error
        options.error(event);
      }
    });
  }
});