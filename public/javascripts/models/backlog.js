var Backlog = Backbone.Model.extend({
  // access to stories child collection
  Themes: function() {
    if (this._themes == null) {
      this._themes = new ThemesCollection(this.get('themes'), { backlog: this });
    }
    return (this._themes);
  },

  Company_ID: function() {
    return this.collection.company_id;
  }
});