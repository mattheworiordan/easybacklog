/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.SprintTabs = {
  Index: App.Views.BaseView.extend({
    childId: function(model) { return 'tab-sprint-' + model.get('id'); },

    events: {
      "click a.new-sprint": "createNew"
    },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var view = this;

      var addTabView = function(model) {
        var tabView = new App.Views.SprintTabs.Show({ model: model, id: view.childId(model) });
        view.$('ul.infinite-tabs').append(tabView.render().el);
      };

      // set up special pinned tabs
      var pinnedTabs = [
        {
          childId: function() { return 'tab-backlog'; },
          get: function() { return 'Backlog'; },
          active: true,
          locked: true
        },
        {
          childId: function() { return 'tab-stats'; },
          get: function() { return 'Stats'; },
          locked: true
        },
      ]

      // add special tabs + sprints
      _(pinnedTabs).each(addTabView);
      _(this.collection.sortBy(function(model) { return -model.get('id'); })).each(addTabView);

      // lets set the UL width as it is not auto-sized as position is fixed, and then resize as the document is resized
      var totalTabWidth = ($('#backlog-data-area .backlog-stats').offset().left - $(view.el).offset().left - 10);
      var windowWidth = $(window).width();
      $(view.el).css('width', totalTabWidth + 'px');
      $(window).resize(function() {
        var resizeWidthBy = $(window).width() - windowWidth;
        if (resizeWidthBy) {
          totalTabWidth += resizeWidthBy;
          windowWidth = $(window).width();
          $(view.el).css('width', totalTabWidth + 'px');
        }
      });

      // fix the slight variances in the DOM where the tab system is one pixel too high or low
      $(this.el).css('top', ($('#themes-header').offset().top - $(this.el.find('ul li:first')).outerHeight()) + 'px');

      // set up the infinity tabs JQuery plugin so that tabs scroll
      view.$('ul.infinite-tabs').activateInfiniteTabs();

      return this;
    },
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'sprint-tab',

    events: {
      "click": "activate"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html( JST['sprints/tabs/show']({ model: this.model }) );
      if (this.model.active) { $(this.el).addClass('active'); }
      if (this.model.locked) { $(this.el).addClass('locked'); }
      return this;
    },

    activate: function() {
      $(this.el).parents('.infinite-tabs').find('li').removeClass('active');
      $(this.el).addClass('active');
    }
  })
};