var Story = Backbone.Model.extend({
  Theme: function() {
    return this.collection.theme;
  }
});