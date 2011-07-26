/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, AcceptanceCriteriaCollection:false */

var Story = Backbone.Model.extend({
  Theme: function() {
    return this.collection.theme;
  },

  // editable if no snapshot master
  IsEditable: function() {
    return (this.collection.theme.IsEditable());
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
    $.post(this.collection.url() + '/' + this.get('id') + '/move-to-theme/' + newThemeId).success(function(ajaxResult, status, response) {
      var themeCollection = story.Theme().collection;
      story.collection.remove(story); // remove story from this theme
      themeCollection.get(Number(newThemeId)).Stories().add(story); // add story model to new theme
      story.set(ajaxResult); // update the story with the new fields such as unique ID
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
  }
});