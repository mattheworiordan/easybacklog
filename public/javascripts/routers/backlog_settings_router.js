App.Routers.BacklogSettings = Backbone.Router.extend({
  currentIteration: false,
  defaultTab: 'Backlog',

  routes: {
    '': 'defaultRoute',
    ':iteration': 'viewSprintOrBacklog' // #Backlog,#1,#2,#3 etc.
  },

  initialize: function(options) {
    _.bindAll(this, 'setTabsReference', 'confirmDiscardChanges');
  },

  // need a reference set to the tabs so that we can obtain the model from the index view which may differ somewhat from the
  //   the model collection because we have pseudo models for the Backlog and Stats tabs
  setTabsReference: function(tabs) {
    this.sprintTabsView = tabs;
  },

  defaultRoute: function() {
    // default tab is Backlog tab
    this.viewSprintOrBacklog(this.defaultTab);
  },

  viewSprintOrBacklog: function(iteration) {
    var model = this.sprintTabsView.getModelFromIteration(iteration),
        that = this;

    if (!model) {
      // tab may have been deleted
      model = this.sprintTabsView.getModelFromIteration(this.defaultTab);
      if (!model) {
        var err = new App.Views.Error({ message: 'Internal error, could not display default tab correctly.  Please refresh your browser' });
      }
    }

    // check if changes have occured that are not saved
    // provide 2 callbacks for different outcomes
    this.confirmDiscardChanges(
      function() {
        // success callback and if appropriate discard changes
        if (that.view) { that.view.restoreState(); } // revert changes in view back to original state before jumping to next tab as for Backlog settings we store the complete DOM and don't use front end templates
        that.view = new App.Views.BacklogSettings.Show({ model: model, sprintTabsView: that.sprintTabsView });
        that.view.render();
        that.sprintTabsView.select(model);
        // store current tab so we can revert if necessary
        that.currentIteration = model.get('iteration');
      }, function() {
        // cancel callback, keep changes and revert tab
        that.sprintTabsView.restoreTab(that.currentIteration); // revert tab back to selected one
        that.navigate(String(that.currentIteration)); // navigate back for router but don't trigger any actions
      }
    );
  },

  confirmDiscardChanges: function(continueWithChangeCallback, cancelCallback) {
    if (this.currentIteration && this.view.stateChanged()) {
      $('#dialog-changed-confirm').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['sprints/changed-confirm-dialog']());
      $('#dialog-changed-confirm').dialog({
        resizable: false,
        height:170,
        modal: true,
        buttons: {
          'Discard changes': function() {
            continueWithChangeCallback();
            $(this).dialog("close");
          },

          Cancel: function() {
            cancelCallback();
            $(this).dialog("close");
          }
        }
      });
    } else {
      continueWithChangeCallback();
    }
  }
});