App.Views.UserTokens = {
  Index: Backbone.View.extend({
    events: {
      "click a.create-new": "createEvent"
    },

    initialize: function() {
      var view = this;
      _.bindAll(this, 'addToView');
      this.collection.each (function(userToken) {
        view.addToView(userToken);
      });
      this.collection.on('add', function(userToken) {
        view.addToView(userToken);
      });
    },

    createEvent: function() {
      var userToken = new UserToken({ access_token: 'generating now...' });
      this.collection.add(userToken);
      userToken.save();
    },

    addToView: function(userToken) {
      var userTokenView = new App.Views.UserTokens.Show({ model: userToken });
      this.$('#list').append(userTokenView.render().el);
      this.$('div.none').hide();
    }
  }),

  Show: Backbone.View.extend({
    events: {
      "click span.delete a": "deleteEvent"
    },

    initialize: function() {
      var view = this;
      this.model.on('change', function() { view.render(); });
    },

    render: function() {
      this.$el.html(JST['templates/user_tokens/show']({ userToken: this.model }));
      return this;
    },

    deleteEvent: function() {
      var parentList = this.$el.parent();
      this.$el.remove();
      this.model.destroy();
      if (parentList.find('div:not(.none)').length === 0) {
        parentList.find('div.none').show();
      }
    }
  })
};