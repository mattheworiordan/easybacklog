/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Backlogs = {
  Show: App.Views.BaseView.extend({
    dataArea: $('#backlog-data-area'), // this view will never exist with others so build an absolute JQuery link

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'navigateEvent','resizeEvent');
    },

    render: function() {
      var view = new App.Views.Themes.Index({ collection: this.model.Themes() });
      this.$('#themes-container').html(view.render().el);

      var show_view = this;

      this.makeFieldsEditable();
      this.updateStatistics();
      $('#backlog-data-area h2.name div.data input').live('keydown', this.navigateEvent); // make all input and textarea fields respond to Tab/Enter

      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc });

      $('#backlog-data-area h2.name div.data').editable(contentUpdatedFunc, defaultOptions);
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
      }
    },

    updateStatistics: function() {
      $('#backlog-data-area .backlog-stats div').html( JST['backlogs/stats']({ model: this.model }) )
    },

    // Tab or Enter key pressed so let's move on
    navigateEvent: function(event) {
      if (_.include([9,13], event.keyCode)) {
        if (!event.shiftKey) { // moving -->
          event.preventDefault();
          $(event.target).blur();
          var firstTheme = $('#themes-container ul.themes li.theme:first>.theme-data .name .data');
          if (firstTheme.length) {
            firstTheme.click();
          } else {
            $('#themes-container ul.themes li.actions a.new-theme').focus();
          }
        } // back can use default functionality as nothing above this
      }
    }
  })
};