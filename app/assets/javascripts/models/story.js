/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, AcceptanceCriteriaCollection:false */

var Story = Backbone.Model.extend({
  Theme: function() {
    return this.collection.theme;
  },

  // editable if no snapshot master, or story is accepted
  IsEditable: function() {
    if (!this.CanEdit()) {
      return false;
    } else {
      return !this.IsAccepted();
    }
  },

  IsLocked: function() {
    return this.collection.theme.IsLocked();
  },

  CanEdit: function() {
    return this.collection.theme.CanEdit();
  },

  CanEditStatus: function() {
    return this.collection.theme.CanEditStatus();
  },

  IsAccepted: function() {
    var sprintStory = this.SprintStory();
    if (sprintStory) {
      if (sprintStory.Status()) {
        return sprintStory.Status().IsAccepted();
      } else {
        return false;
      }
    }
    return false;
  },

  // access to acceptance criteria child collection
  AcceptanceCriteria: function() {
    if (!this._acceptance_criteria) {
      this._acceptance_criteria = new AcceptanceCriteriaCollection(this.get('acceptance_criteria'), { story: this });
      this.unset('acceptance_criteria'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._acceptance_criteria);
  },

  MoveToTheme: function(newThemeId, options) {
    var story = this;
    $.post(this.collection.url() + '/' + this.get('id') + '/move-to-theme/' + newThemeId).success(function(response) {
      var themeCollection = story.Theme().collection;
      story.collection.remove(story); // remove story from this theme
      themeCollection.get(Number(newThemeId)).Stories().add(story); // add story model to new theme
      story.set(response); // update the story with the new fields such as unique ID
      story.trigger('change:unique_id'); // force unique ID to be updated as the theme code has changed
      if (_.isFunction(options.success)) {
        // callback for success
        options.success(story, response);
      }
    }).error(function(event, response) {
      if (window.console) { console.log('Move to theme failed'); }
      if (_.isFunction(options.error)) {
        // callback for error
        options.error(story, response);
      }
    });
  },

  // access the sprint object if it exists for this story
  SprintStory: function() {
    var sprintStoryFound = null,
        that = this;

    this.Theme().Backlog().Sprints().each(function(sprint) {
      if (sprintStoryFound) { return; }
      sprint.SprintStories().each(function(sprintStory) {
        if (!sprintStoryFound && (sprintStory.get('story_id') === that.get('id'))) {
          sprintStoryFound = sprintStory;
        }
      });
    });

    return sprintStoryFound;
  }
});