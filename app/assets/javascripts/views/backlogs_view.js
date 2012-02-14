/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.Backlogs = {
  Show: App.Views.BaseView.extend({
    dataArea: $('#backlog-data-area'), // this view will never exist with others so build an absolute JQuery link
    useOptions: {}, // options reflecting whether cost or day estimating is enabled

    initialize: function(options) {
      var columns = $('#backlog-container #themes-header .columns');
      App.Views.BaseView.prototype.initialize.call(this);
      this.sprintTabsView = options.sprintTabsView;
      _.bindAll(this, 'activated');
      this.useOptions = {
        use5090Estimates: columns.find('.score-50').length ? true : false,
        useCostEstimates: columns.find('.cost-formatted').length ? true : false,
        useDaysEstimates: columns.find('.days-formatted').length ? true : false
      };
    },

    render: function() {
      var view = new App.Views.Themes.Index(_.extend({ collection: this.model.Themes() }, this.useOptions));
      this.$('#themes-container').html(view.render().el);

      var show_view = this;

      this.activated();

      return (this);
    },

    updateStatistics: function() {
      $('#backlog-data-area .backlog-stats').html( JST['templates/backlogs/stats'](_.extend({ model: this.model }, this.useOptions)) );
      this.sprintTabsView.adjustTabConstraints(true);
    },

    // view is made active, but not necessarily re-rendered for performance reasons
    activated: function() {
      this.updateStatistics();

      if (this.model.IsEditable()) {
        // delay before making first element focussed as sometimes editable text is rendered before page is complete
        //  and is thus incorrectly positioned
        setTimeout(function() {
          var firstEditableElem = $('ul.themes li.theme:first .theme-data .name .data');
          if (firstEditableElem.length) {
            firstEditableElem.click();
          } else {
            $('ul.themes li.actions a.new-theme').focus();
          }
        }, 10);
      }
    }
  })
};