/*global Backbone:false, $:false, _:false, JST:false, Sprint:false, App:false */

var SprintStoryStatusesCollection = Backbone.Collection.extend({
  model: SprintStoryStatus,
  url: '/sprint-story-statuses'
});