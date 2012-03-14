/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

var SprintStoryStatus = Backbone.Model.extend({
  AcceptedCode: 'D',

  IsAccepted: function() {
    return this.get('code').toUpperCase() == this.AcceptedCode;
  }
});