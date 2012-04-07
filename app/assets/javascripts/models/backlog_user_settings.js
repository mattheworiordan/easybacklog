/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, ThemesCollection:false, SprintsCollection:false */

var BacklogUserSettings = Backbone.Model.extend({
  url: function() {
    return this.backlog.collection.url() + '/' + this.backlog.id + '/user-settings';
  },

  initialize: function(models, options) {
    this.backlog = options ? options.backlog : null;
  },

  themeList: function() {
    if (this.get('collapsed_themes')) {
      return this.get('collapsed_themes').split(',');
    } else {
      return [];
    }
  },

  addCollapsedTheme: function(themeId) {
    var themes = this.themeList();
    if (themes.indexOf(String(themeId)) === -1) {
      themes.push(String(themeId));
    }
    this.save({ 'collapsed_themes': themes.join(',') });
  },

  removeCollapsedTheme: function(themeId) {
    var themes = this.themeList();
        index = themes.indexOf(String(themeId));
    if (index !== -1) {
      themes.splice(index, 1);
    }
    this.save({ 'collapsed_themes': themes.join(',') });
  },

  isCollapsedTheme: function(themeId) {
    return this.themeList().indexOf(String(themeId)) !== -1;
  }
});