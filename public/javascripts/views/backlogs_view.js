/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.Backlogs = {
  Show: App.Views.BaseView.extend({
    dataArea: $('#backlog-data-area'), // this view will never exist with others so build an absolute JQuery link

    initialize: function(options) {
      App.Views.BaseView.prototype.initialize.call(this);
      this.sprintTabsView = options.sprintTabsView;
      _.bindAll(this, 'activated');
    },

    render: function() {
      var use5090estimates = $('#backlog-container #themes-header .columns .score-50').length ? true : false;
      var view = new App.Views.Themes.Index({ collection: this.model.Themes(), use5090estimates: use5090estimates });
      this.$('#themes-container').html(view.render().el);

      var show_view = this;

      this.updateStatistics();

      if (this.model.IsEditable()) {
        var firstEditableElem = $('ul.themes li.theme:first .theme-data .name .data');
        if (firstEditableElem.length) {
          firstEditableElem.click();
        } else {
          $('ul.themes li.actions a.new-theme').focus();
        }
      }

      return (this);
    },

    updateStatistics: function() {
      $('#backlog-data-area .backlog-stats').html( JST['backlogs/stats']({ model: this.model }) );
      this.sprintTabsView.adjustTabConstraints(true);
    },

    // view is made active, but not necessarily re-rendered for performance reasons
    activated: function() {
      this.updateStatistics();
    }
  })
};