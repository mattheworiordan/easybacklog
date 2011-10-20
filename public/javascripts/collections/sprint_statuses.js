/*global Backbone:false, $:false, _:false, JST:false, Sprint:false, App:false */

var SprintStatusesCollection = Backbone.Collection.extend({
  model: SprintStatus,
  url: '/sprint-statuses'
});