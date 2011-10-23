/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogStats = {
  Show: App.Views.BaseView.extend({
    events: {
      // "click a.delete-sprint": "deleteSprint"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      // _.bindAll(this);
    },

    render: function() {
      $(this.el).html(JST['backlogs/sprint-progress-stats']({ model: this.model }));
      return this;
    }
  })
};