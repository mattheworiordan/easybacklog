/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var Sprint = Backbone.Model.extend({
  Backlog: function() {
    return this.collection.backlog;
  }
});