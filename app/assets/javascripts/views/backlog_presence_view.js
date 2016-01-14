/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogPresence = {
  Show: App.Views.BaseView.extend({
    initialize: function(options) {
      this.clientId = String(options.user.id);
      this.name = options.user.name;
      this.accounts = options.user.accounts;

      this.ably = new Ably.Realtime({
        authUrl: '/realtime-token',
        clientId: this.clientId // TODO: Remove, see https://github.com/ably/ably-js/issues/198
      });

      this.backlogChannel = this.ably.channels.get('backlog-' + this.model.get('id'));
      this.globalChannel = this.ably.channels.get('global-editors');
    },

    render: function() {
      if (App.environment !== 'test') {
        // only open a connection if the user has edit rights to the backlog
        if (this.model.IsEditable()) {
          this.enterChannel();
          this.leaveOnUnload();
        }
      }
      return this;
    },

    enterChannel: function() {
      var that = this;
      var enterChannels = function() {
        that.backlogChannel.presence.enter({ name: that.name });
        that.backlogChannel.presence.subscribe(that.showDuplicateEditorWarning.bind(that));
        that.globalChannel.presence.enter({
          name: that.name,
          accounts: that.accounts,
          backlogId: that.model.get('id'),
          since: new Date().getTime()
        });
      }

      if (that.ably.connection.state == 'connected') {
        enterChannels();
      } else {
        that.ably.connection.on('connected', function() {
          enterChannels();
        })
      }
    },

    showDuplicateEditorWarning: function() {
      var that = this;
      that.backlogChannel.presence.get(function(err, members) {
        if (err) {
          (console.error || console.log)('Presence members get failed:', err);
          return;
        }
        var people = _(members).reject(function(member) { return member.clientId === that.clientId });
        people = _.uniq(_.map(people, function(person) { return person.data.name }));
        $(that.el).html(JST['templates/backlogs/presence']({ people: people }));
        if (people.length > 0) {
          $(that.el).show();
        } else {
          $(that.el).hide();
        }
      });
    },

    leaveOnUnload: function() {
      var that = this;
      window.onbeforeunload = function() {
        that.ably.close();
      }
    }
  })
};
