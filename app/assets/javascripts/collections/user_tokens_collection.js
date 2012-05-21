var UserTokensCollection = Backbone.Collection.extend({
  model: UserToken,

  url: function() {
    return '/user-tokens';
  }
});