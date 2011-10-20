App.Routers.Backlog = Backbone.Router.extend({
  routes: {
    ':iteration': 'viewSprintOrBacklog' // #Backlog,#Stats,#1,#2,#3 etc.
  },

  initialize: function(options) {
    _.bindAll(this, 'setTabsReference');
  },

  // need a reference set to the tabs so that we can obtain the model from the index view which may differ somewhat from the
  //   the model collection because we have pseudo models for the Backlog and Stats tabs
  setTabsReference: function(tabs) {
    this.tabsView = tabs;
  },

  viewSprintOrBacklog: function(iteration) {
    // var model = this.tabsView.getModelFromIteration(iteration);
    //    if (model) { // tab may have been deleted
    //      // var view = new App.Views.Backlogs.Show({ model: model, el: $('section.content'), tabsView: this.tabsView });
    //      this.tabsView.select(model);
    //      // view.render();
    //    }
  }
});