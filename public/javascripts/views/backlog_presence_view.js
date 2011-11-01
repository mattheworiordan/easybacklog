/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogPresence = {
  Show: App.Views.BaseView.extend({
    presenceServerUrl: 'https://easybacklog-async.herokuapp.com/',

    initialize: function(options) {
      this.userId = Math.floor(Math.random()*1000000000).toString(36);
      this.name = options.name;
    },

    render: function() {
      var that = this;

      if (App.environment !== 'test') {
        that.startPolling();
        that.closeConnectionOnUnload();
      }

      return (this);
    },

    startPolling: function() {
      var that = this;
      var _poll = function() {
        $.ajax({
          url: that.presenceServerUrl + '/poll',
          data: { id: that.userId, name: that.name, channel: that.model.get('id') },
          type: 'POST',
          dataType: 'json',
          crossDomain: true,
          success: function(response) {
            if (response) {
              if (response.length > 1) {
                var people = _(response).reject(function(elem) { return elem.id === that.userId; });
                $(that.el).html(JST['backlogs/presence']({ people: people }));
                $(that.el).show();
              } else {
                if ($(that.el).is(':visible')) {
                  $(that.el).hide();
                }
              }
            }
            _poll();
          },
          error: function(jqXHR) {
            if (jqXHR.status === 410) {
              if (window.console) { console.log("Connection closed upon request"); }
            } else {
              // try again in 5 seconds
              setTimeout(_poll, 5000);
            }
          }
        });
      }
      _poll();
    },

    closeConnectionOnUnload: function() {
      var that = this;
      window.onbeforeunload = function() {
        $.ajax({
          url: that.presenceServerUrl + '/close',
          data: { id: that.userId, channel: that.model.get('id') },
          type: 'POST',
          crossDomain: true,
          async: false,
          success: function(response) {
            if (window.console) { console.log("Connection close request received"); }
          },
          error: function() {
            if (window.console) { console.log("Connection close request failed"); }
          }
        });
        return null;
      }
    }
  })
};