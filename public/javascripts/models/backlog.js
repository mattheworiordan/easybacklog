/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, ThemesCollection:false */

var Backlog = Backbone.Model.extend({
  url: function() {
    // if part of a snapshot, then show the backlog & snapshot id
    // url specified explicitly for this model as IE8 was assuming the URL was the same as page loaded for the AJAX request
    // and caching it occassionally
    return (this.collection.url() +
      (this.isNew() ? '' : '/' + (this.get('snapshot_master_id') ? this.get('snapshot_master_id') + '/snapshots/' : '') + this.id) +
      '?cache-buster' + Math.floor(Math.random()*1000000));
  },

  // editable if no snapshot master
  IsEditable: function() {
    return (this.get('is_editable') ? true : false);
  },

  // access to stories child collection
  Themes: function() {
    if (!this._themes) {
      this._themes = new ThemesCollection(this.get('themes'), { backlog: this });
      this.unset('themes'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._themes);
  },

  Account_ID: function() {
    return this.collection.account_id;
  }
});