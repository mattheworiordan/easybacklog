/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Backlogs = {
  Show: App.Views.BaseView.extend({
    dataArea: $('#backlog-data-area'), // this view will never exist with others so build an absolute JQuery link

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'navigateEvent','print');
    },

    render: function() {
      var view = new App.Views.Themes.Index({ collection: this.model.Themes() });
      this.$('#themes-container').html(view.render().el);

      var show_view = this;

      this.makeFieldsEditable();
      this.updateStatistics();
      $('#backlog-data-area div.data, #backlog-data-area div.data input').live('keydown', this.navigateEvent); // make all input and textarea fields respond to Tab/Enter

      // print link should show a dialog first
      $('#backlog-data-area .actions #print').live('click', this.print);

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
      if (_.include([9,13,27], event.keyCode)) { // tab, enter, esc
        $(event.target).blur();
        try { // cannot preventDefault if esc as esc event is triggered manually from jeditable
          event.preventDefault();
        } catch (e) { }

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
    },

    print: function(event) {
      var view = this;
      event.preventDefault();
      $('#dialog-print').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['backlogs/print-dialog']({ backlog: this.model }));
      $('#dialog-print').dialog({
        resizable: false,
        height:350,
        width: 400,
        modal: true,
        buttons: {
          Print: function() {
            // get the page size & fold side values from the select fields
            var page_size = $(this).find('#page-size option:selected').attr('id');
            var fold_side = $(this).find('#fold-side option:selected').attr('id');

            // save the cookie so settings are remembered
            $.cookie("fold-side-default", fold_side);
            $.cookie("page-size-default", page_size);

            // download the PDF in the background
            var printUrl = $(event.target).attr('href');
            printUrl += '?print_scope=' + $(this).find('#print-scope option:selected').attr('id')
              + '&page_size=' + page_size
              + '&fold_side=' + fold_side;
            document.location.href = printUrl;

            // update the dialog to say we're updating and then close after a short period
            $(this).find('p.progress-placeholder').html('Please wait, we\'re preparing your PDF...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
            var dialog = this;
            _.delay(function() { $(dialog).dialog("close"); }, 2000);
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    }
  })
};