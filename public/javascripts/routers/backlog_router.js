App.Routers.Backlog = Backbone.Router.extend({
  backlogView: false,

  routes: {
    '': 'showBacklog',
    'Backlog': 'showBacklog',
    'Stats': 'showStats',
    ':iteration': 'viewSprint' // #1,#2,#3 etc.
  },

  initialize: function(options) {
    _.bindAll(this, 'setTabsReference');
  },

  // need a reference set to the tabs so that we can obtain the model from the index view which may differ somewhat from the
  //   the model collection because we have pseudo models for the Backlog and Stats tabs
  setTabsReference: function(tabs) {
    this.sprintTabsView = tabs;
  },

  showBacklog: function() {
    if (!this.backlogView) {
      this.backlogView = new App.Views.Backlogs.Show({ model: App.Collections.Backlogs.at(0), el: $('#backlog-container') });
      this.showContainer('#backlog-container'); // needs to be visible as render sets focus on first theme
      this.backlogView.render();
    } else {
      this.showContainer('#backlog-container');
    }
    this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration('Backlog'));
  },

  showStats: function() {
    var view = new App.Views.BacklogStats.Show({ model: App.Collections.Backlogs.at(0), el: $('#stats-container') });
    this.showContainer('#stats-container');
    view.render();
    this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration('Stats'));
  },

  viewSprint: function(iteration) {
    var model = this.sprintTabsView.getModelFromIteration(iteration);

    if (!model) {
      var err = new App.Views.Error({ message: 'Internal error, could not display sprint correctly.  Please refresh your browser' });
    } else {
      this.view = new App.Views.Sprints.Show({ model: model, el: $('#sprints-container') });
      this.showContainer('#sprints-container');
      this.view.render();
      this.sprintTabsView.select(model);
    }
  },

  // set the class on the main content pod which in turns toggles visiblity of divs and sets styles
  showContainer: function(container) {
    containers = ['#sprints-container', '#stats-container', '#backlog-container'];
    _(containers).each(function(elem) {
      $('section.main-content-pod').removeClass('showing-' + elem.replace(/#|\-container/gi,''));
    });
    $('section.main-content-pod').addClass('showing-' + container.replace(/#|\-container/gi,''));
  }
});