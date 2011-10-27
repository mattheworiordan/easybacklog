/*global Backbone:false, $:false, _:false, JST:false, Story:false, App:false */

var SprintStoriesCollection = Backbone.Collection.extend({
  model: SprintStory,
  sprint: null,

  url: function() {
    if (!this.sprint) {
      var errorView = new App.Views.Error({ message: 'Error, cannot find Sprint and thus cannot load SprintStory' });
    } else {
      return '/sprints/' + this.sprint.get('id') + '/sprint-stories';
    }
  },

  initialize: function(models, options) {
    this.sprint = options ? options.sprint : null;
  },

  getByStoryId: function(storyId) {
    var sprintStoryMatch = null;
    this.each(function (sprintStory) {
      if (Number(sprintStory.get('story_id')) === Number(storyId)) {
        sprintStoryMatch = sprintStory;
      }
    });
    return sprintStoryMatch;
  },

  // update order of multiple sprint stories simultaneously (reduce network traffic of individual updates)
  // params is collection of { sprintStoryId: position (order), ... }
  batchUpdatePosition: function(params, options) {
    var url = '/sprints/' + this.sprint.get('id') + '/sprint-stories/update-order',
        that = this;

    options = options || {};
    data = _(params).map(function(val, key) { return 'ids[' + key + ']=' + val; }).join('&');
    $.ajax(url, {
      success: function(data) {
        // update models with new positions
        _(data).each(function(val) {
          that.get(val.id).set(val);
        });
        if (options.success) { options.success.apply(this, arguments); }
      },
      error: function() { if (options.error) { options.error.apply(this, arguments); } },
      data: data,
      dataType: 'json',
      type: 'PUT'
    })
  }
});