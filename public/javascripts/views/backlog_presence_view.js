/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogPresence = {
  Show: App.Views.BaseView.extend({
    initialize: function(options) {
      this.userId = options.userId;
      this.name = options.name;
      // _.bindAll(this, 'activated');
    },

    render: function() {
      var that = this;

      // start polling, but let things settle first
      setTimeout(function() {
        that.startPolling();
      }, 1500);

      return (this);
    },

    startPolling: function() {
      var that = this;
      if (!this.clientId) { this.clientId = Math.floor(Math.random()*1000000000).toString(36); }
      var _poll = function() {
        $.ajax({
          url: 'https://easybacklog-async.herokuapp.com/poll',
          data: { id: that.clientId, name: that.name, channel: that.model.get('id') },
          type: 'POST',
          dataType: 'json',
          crossDomain: true,
          success: function(response) {
            if (response) {
              if (response.length > 1) {
                var people = _(response).reject(function(elem) { return elem.id === that.clientId; });
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
          error: function() {
            // try again in 5 seconds
            setTimeout(_poll, 5000);
          }
        });
      }
      _poll();
    }
  })
};