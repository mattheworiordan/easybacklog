var Backlog = Backbone.Model.extend({
  // access to stories child collection
  Themes: function() {
    if (this._themes == null) {
      this._themes = new ThemesCollection(this.get('themes'), { backlog: this });
      this.unset('themes'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._themes);
  },

  Company_ID: function() {
    return this.collection.company_id;
  }
});