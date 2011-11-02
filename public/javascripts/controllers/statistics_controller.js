/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

App.Controllers.Statistics = {
  // Stats are passed as an object stats
  // Update the respective model with the correct statistics
  // Fire the trigger event on the model to update the stats in the view
  updateStatistics: function(stats) {
    if (!_.isEmpty(stats)) {
      var backlog = App.Collections.Backlogs.last();
      var statsWithoutThemes = _.clone(stats);
      delete statsWithoutThemes.themes;
      backlog.set(statsWithoutThemes);
      backlog.trigger('statisticsUpdated');
      _.each(stats.themes, function(themeData) {
        var theme = backlog.Themes().get(themeData.theme_id);
        if (theme) {
          theme.set(themeData); // update stats in theme model
          theme.trigger('statisticsUpdated');
        }
      });
    }
  }
};