/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, ThemesCollection:false, SprintsCollection:false */

var Backlog = Backbone.Model.extend({
  url: function() {
    // if part of a snapshot, then show the backlog & snapshot id
    // url specified explicitly for this model as IE8 was assuming the URL was the same as page loaded for the AJAX request
    // and caching it occassionally
    return (this.collection.url() +
      (this.isNew() ? '' : '/' + (this.get('snapshot_master_id') ? this.get('snapshot_master_id') + '/snapshots/' : '') + this.id) +
      '?cache-buster' + Math.floor(Math.random()*1000000));
  },

  // Backlog may not be editable because it's locked (archive, snapshot) or because the user does not have the necessary privileges
  IsEditable: function() {
    return this.CanEdit();
  },

  // Backlog could be locked based on whether it's an archive or snapshot
  IsLocked: function() {
    return this.get('is_locked');
  },

  // Whether user has permission to edit this backlog
  CanEdit: function() {
    return this.get('is_editable') ? true : false;
  },

  // Whether user has permission to edit the status of stories in this backlog
  CanEditStatus: function() {
    return this.get('is_status_editable') ? true : false;
  },

  // access to themes child collection
  Themes: function() {
    if (!this._themes) {
      this._themes = new ThemesCollection(this.get('themes'), { backlog: this });
      this.unset('themes'); // clear from object as it will be sent back to the server adding to the payload
    }
    return this._themes;
  },

  // access to sprints collection
  Sprints: function() {
    if (!this._sprints) {
      this._sprints = new SprintsCollection(this.get('sprints'), { backlog: this });
      this.unset('sprints'); // clear from object as it will be sent back to the server adding to the payload
    }
    return this._sprints;
  },

  Account_ID: function() {
    return this.collection.account_id;
  },

  UserSettings: function() {
    if (!this._userSettings) {
      this._userSettings = new BacklogUserSettings(this.get('backlog_user_settings'), { backlog: this });
      this.unset('backlog_user_settings');
    }
    return this._userSettings;
  }
});