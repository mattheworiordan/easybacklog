/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogPresence = {
  Show: App.Views.BaseView.extend({
    presenceServerUrl: window.location.protocol + '//realtime-easybacklog.dotcloud.com/',

    initialize: function(options) {
      this.userId = Math.floor(Math.random()*1000000000).toString(36);
      this.name = options.name;
    },

    render: function() {
      var that = this;

      // support Cross Domain Scripting Security
      $.support.cors = true;

      if (App.environment !== 'test') {
        that.startPolling();
        that.closeConnectionOnUnload();
      }

      return (this);
    },

    ajaxRequest: function(options) {
      var that = this,
          ajaxOptions = {
            url: that.presenceServerUrl + options.path,
            data: options.data,
            crossDomain: true,
            success: function(response) { if (options.success) { options.success(response); } },
            error: function(jqXHR) { if (options.error) { options.error(jqXHR); } }
          }

      if ($.browser.msie && parseInt($.browser.version, 10) >= 8) {
        // IE does not support cross domain AJAX requests
        // it does have a XDomainRequest object, but I tried that, and it behaved
        // strangely and randomly disconnected connections, so we have had to revert to JSON-P for IE
        _.extend(ajaxOptions, {
          type: 'GET',
          cache: false,
          dataType: 'jsonp'
        });

        $.ajax(ajaxOptions);
      } else {
        _.extend(ajaxOptions, {
          type: 'POST'
        });

        $.ajax(ajaxOptions);
      }
    },

    startPolling: function() {
      var that = this;
      var _poll = function() {
        that.ajaxRequest({
          path: 'poll',
          data: { id: that.userId, name: that.name, channel: that.model.get('id') },
          success: function(response) {
            if (response && response.length) { // must be an array or else we've got an empty response
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
        that.ajaxRequest({
          path: 'close',
          data: { id: that.userId, channel: that.model.get('id') },
          success: function(response) {
            if (window.console) { console.log("Connection close request sent"); }
          },
          error: function(jqXHR) {
            if (window.console) { console.log("Connection close request FAILED"); }
          }
        });
      }
    }
  })
};