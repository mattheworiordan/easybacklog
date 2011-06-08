App.Controllers.Statistics = {
  // Stats are passed as an object stats
  // Update the respective model with the correct statistics
  // Fire the trigger event on the model to update the stats in the view
  updateStatistics: function(stats) {
    if (!_.isEmpty(stats)) {
      window.console && console.log('Updating stats for themes ' + _.map(stats.themes, function(theme) { return theme.theme_id; }).join(','));
      var backlog = App.Collections.Backlogs.last();
      var statsWithoutThemes = _.clone(stats);
      delete statsWithoutThemes['themes'];
      backlog.set(statsWithoutThemes);
      backlog.trigger('statisticsUpdated');
      _.each(stats.themes, function(themeData) {
        var theme = backlog.Themes().get(themeData.theme_id);
        theme.set(themeData); // update stats in theme model
        theme.trigger('statisticsUpdated');
      });

    }
  }
}