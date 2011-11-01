/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var SprintStoryStatus = Backbone.Model.extend({
  DoneCode: 'D',

  isDone: function() {
    return this.get('code').toUpperCase() == this.DoneCode;
  }
});