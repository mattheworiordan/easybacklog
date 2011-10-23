/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.Sprints = {
  Show: App.Views.BaseView.extend({
    events: {
      // "click a.delete-sprint": "deleteSprint"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      // _.bindAll(this);
    },

    render: function() {
      var that = this;
      $(this.el).html(JST['sprints/show']({ model: this.model }));
      this.model.SprintStories().each(function(model) {
        var view = new App.Views.Sprints.Story({ model: model });
        $(that.el).find('.stories-container').append(view.render().el);
      });
      return this;
    }
  }),

  Story: App.Views.BaseView.extend({
    tagName: 'div',
    className: 'story',

    events: {
      // "click a.delete-sprint": "deleteSprint"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      // _.bindAll(this);
    },

    render: function() {
      $(this.el).html(JST['sprints/story-editable']({ sprintStory: this.model, model: this.model.Story() }));
      return this;
    }
  })
};