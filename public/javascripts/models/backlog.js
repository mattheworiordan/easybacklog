var Backlog = Backbone.Model.extend({
  url: function() {
    // url specified explicitly for this model as IE8 was assuming the URL was the same as page loaded for the AJAX request and caching it occassionally
    return (this.collection.url() + (this.isNew() ? '' : '/' + this.id) + '?cache-buster' + Math.floor(Math.random()*1000000));
  },

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