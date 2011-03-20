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
      $('#backlog-data-area div.data input').live('keydown', this.navigateEvent); // make all input and textarea fields respond to Tab/Enter

      var firstEditableElem = $('ul.themes li.theme:first .theme-data .name .data');
      if (firstEditableElem.length) {
        firstEditableElem.click();
      } else {
        $('ul.themes li.actions a.new-theme').focus();
      }
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function(value, settings) { return show_view.contentUpdated(value, settings, this); };
      var beforeChangeFunc = function(value, settings) { return show_view.beforeChange(value, settings, this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc, lesswidth: -20 });
      // for rate we need to drop the locale formatted rate and use rate as a numeric
      var previousRateFormatted, previousRate;
      var beforeRateChangeFunc = function(value, settings) { previousRateFormatted = value; previousRate = show_view.model.get('rate'); return show_view.beforeChange(previousRate, settings, this); }
      var rateUpdatedFunc = function(value, settings) {
        if (previousRate == value) { // no change to rate, so revert back to formatted rate
          _.delay(function() { show_view.changeEvent('change:rate_formatted') }, 100);
        }
        return show_view.contentUpdated(value, settings, this);
      };

      $('#backlog-data-area h2.name .data, #backlog-data-area #backlog-velocity .data').editable(contentUpdatedFunc, defaultOptions);
      $('#backlog-data-area #backlog-rate .data').editable(rateUpdatedFunc, _.extend(_.clone(defaultOptions), { data: beforeRateChangeFunc }));
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        if (fieldChanged == 'rate_formatted') {
          $('#backlog-data-area .rate>div.data').text(this.model.get(fieldChanged));
        } else {
          $('#backlog-data-area .' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
        }
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
      }
    },

    updateStatistics: function() {
      $('#backlog-data-area .backlog-stats div.output').html( JST['backlogs/stats']({ model: this.model }) )
    },

    // Tab or Enter key pressed so let's move on
    navigateEvent: function(event) {
      if (_.include([9,13], event.keyCode)) {
        event.preventDefault();
        $(event.target).blur();
        if (!event.shiftKey) { // moving -->
          var firstTheme = $('#themes-container ul.themes li.theme:first>.theme-data .name .data');
          if (firstTheme.length) {
            firstTheme.click();
          } else {
            $('#themes-container ul.themes li.actions a.new-theme').focus();
          }
        } else {
          // there are no further items so focus on title if not on title
          if (!$(event.target).parents('h2.name').is('h2')) {
            $('#backlog-data-area h2.name>div.data').click()
          } else {
            // nothing higher, focus on last button
            $('li:last a:last').focus();
          }
        }
      }
    }
  })
};