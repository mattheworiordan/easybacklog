App.Routers.Backlog = Backbone.Router.extend({
  backlogView: false,
  oldView: false,

  routes: {
    '': 'showBacklog',
    'Backlog': 'showBacklog',
    'Stats': 'showStats',
    'Sprints': 'showSprintsHelp',
    ':iteration': 'showSprint' // #1,#2,#3 etc.
  },

  initialize: function(options) {
    _.bindAll(this, 'setTabsReference', 'cleanUpOldView');
  },

  // need a reference set to the tabs so that we can obtain the model from the index view which may differ somewhat from the
  //   the model collection because we have pseudo models for the Backlog and Stats tabs
  setTabsReference: function(tabs) {
    this.sprintTabsView = tabs;
  },

  showBacklog: function() {
    this.cleanUpOldView();
    if (!this.backlogView) {
      this.backlogView = new App.Views.Backlogs.Show({ model: App.Collections.Backlogs.at(0), el: $('#backlog-container'), sprintTabsView: this.sprintTabsView });
      this.showContainer('#backlog-container'); // needs to be visible as render sets focus on first theme
      this.backlogView.render();
    } else {
      this.backlogView.activated();
      this.showContainer('#backlog-container');
    }
    this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration('Backlog'));
  },

  showStats: function() {
    this.cleanUpOldView();
    this.oldView = new App.Views.BacklogStats.Show({ model: App.Collections.Backlogs.at(0), el: this.replaceWithNew('#stats-container') });
    this.showContainer('#stats-container');
    this.oldView.render();
    this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration('Stats'));
  },


  showSprintsHelp: function() {
    this.cleanUpOldView();
    this.oldView = new App.Views.Sprints.Help({ sprintTabsView: this.sprintTabsView, el: this.replaceWithNew('#sprints-help-container') });
    this.showContainer('#sprints-help-container');
    this.oldView.render();
    this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration('Sprints'));
  },

  showSprint: function(iteration) {
    var model = this.sprintTabsView.getModelFromIteration(iteration);

    this.cleanUpOldView();

    if (!model) {
      var err = new App.Views.Warning({ message: 'Sprint ' + iteration + ' was not found' });
      this.navigate('Backlog', true);
    } else {
      this.oldView = new App.Views.Sprints.Show({ model: model, el: this.replaceWithNew('#sprints-container'), sprintTabsView: this.sprintTabsView });
      this.showContainer('#sprints-container');
      this.oldView.render();
      this.sprintTabsView.select(model);
    }
  },

  replaceWithNew: function(nodePath) {
    var oldNode = $(nodePath).empty(), // empty the node of all children
        oldNodeHtml = oldNode[0].outerHTML || new XMLSerializer().serializeToString(oldNode[0]);
    $(nodePath).replaceWith($(oldNodeHtml));
    return $(nodePath);
  },

  // set the class on the main content pod which in turns toggles visiblity of divs and sets styles
  showContainer: function(container) {
    containers = ['#sprints-container', '#sprints-help-container', '#stats-container', '#backlog-container'];
    _(containers).each(function(elem) {
      $('section.main-content-pod').removeClass('showing-' + elem.replace(/#|\-container/gi,''));
    });
    $('section.main-content-pod').addClass('showing-' + container.replace(/#|\-container/gi,''));
  },

  cleanUpOldView: function() {
    if (this.oldView) {
      if (_.isFunction(this.oldView.cleanUp)) {
        this.oldView.cleanUp();
      }
      this.oldView = false;
    }
  }
});