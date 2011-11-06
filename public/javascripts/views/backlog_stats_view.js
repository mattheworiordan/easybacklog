/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogStats = {
  Show: App.Views.BaseView.extend({
    events: {
      "click a#stats-backlog-settings-change": "backlogSettings",
      "click input#show-projected": 'burnDownProjectedCheckboxClicked'
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);

      // _.bindAll(this);
    },

    render: function() {
      var that = this;
      $(this.el).html(JST['backlogs/sprint-progress-stats']({ model: this.model }));
      $('#backlog-data-area .backlog-stats').html('');
      that.waitUntilChartsLoaded(function() {
        that.showCharts();
      });
      return this;
    },

    activated: function() {
      // show we're loading again
      $('#backlog-data-area .backlog-stats').html('');
      this.$('.loading').show();
      this.$('.stats').hide();
      this.$('.no-stats').hide();
      this.showCharts();
    },

    // as we load high charts on document.ready (to improve overall rendering speed),
    // we need to wait until high charts becomes available assuming user has jumped straight to #stats
    waitUntilChartsLoaded: function(callback, counter) {
      var nextRequestIn = 250,
          that = this;

      if (!counter) { counter = 1; }
      if (!window.Highcharts) {
        if (counter * nextRequestIn > 10000) {
          // taken longer than 10 seconds, something is wrong
          new App.Views.Error({ message: 'Internal error, could not load charting libraries.  Please refresh your browser.' });
        } else {
          setTimeout(function() { that.waitUntilChartsLoaded(callback, counter+1); }, nextRequestIn);
        }
      } else {
        callback();
      }
    },

    showCharts: function() {
      var that = this;
      if (this.model.Sprints().select(function(sprint) { return sprint.isComplete(); }).length > 0) {
        // load data and then...
        $.get('/backlogs/' + this.model.get('id') + '/backlog-stats', {}, function(data) {
          that.$('.loading').hide();
          that.$('.stats').show();
          that.$('.no-stats').hide();

          if ($.cookie('stats_show_projected') === 'no') {
            that.$('#show-projected').removeAttr('checked')
          } else {
            that.$('#show-projected').attr('checked','checked')
          }

          that.displayBurnDown(data.burn_down);
          that.displayBurnUp(data.burn_up);
          that.displayVelocityCompleted(data.velocity_completed);
          that.displayVelocityStats(data.velocity_stats);
        });
      } else {
        // no sprints are completed, show placeholder
        this.$('.loading').hide();
        this.$('.stats').hide();
        this.$('.no-stats').show();
      }
    },

    backlogSettings: function(event) {
      event.preventDefault();
      document.location.href = $('#backlog-data-area a:last').attr('href');
    },

    displayBurnDown: function(data) {
      this.burnDownChart = new Highcharts.Chart({
        chart: {
          renderTo: 'burn-down-chart',
          type: 'line'
        },
        title: {
          text: 'Burn down'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e %b',
            year: '%b'
          }
        },
        yAxis: {
          title: {
             text: 'Points'
          },
          min: 0
        },
        colors: [
          '#0000FF',
          '#FF0000',
          '#FF0000'
        ],
        tooltip: {
          formatter: function() {
            var dataSeries,
                that = this,
                sprint, completedTerminology, pluralize,
                seriesName = this.series.name,
                html;

            switch(seriesName) {
              case 'Trend':
                dataSeries = data.trend;
                completedTerminology = 'expected'
                break;
              case 'Projected':
                dataSeries = data.projected;
                completedTerminology = 'projected'
                break;
              case 'Actual':
                dataSeries = data.actual;
                completedTerminology = 'completed'
            }

            sprint = _(dataSeries).find(function(elem) { return that.x === parseRubyDate(elem.completed_on).getTime(); });

            // if rolling over first point of project, show the actual data instead as projected first point is misleading
            if ( (dataSeries === data.projected) && (sprint === data.projected[0]) ) {
              dataSeries = data.actual;
              completedTerminology = 'completed';
              sprint = _(data.actual).last();
              seriesName = 'Actual';
            }

            pluralize = function(val) { return val === 1 ? '' : 's'; },
            round = function(val) { return Math.max(0,Math.round(val * 10)/10); }

            html = '<b>'+ seriesName;
            if (sprint.iteration === 0) {
              html += ' - Sprint 0</b> (Project start)<br/>' +
                'Project started on ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.starts_on)) + '<br/>' +
                round(this.y) + ' points remaining';
            } else {
              html += ' - Sprint ' + sprint.iteration + '</b><br/>' +
                'Sprint ' + sprint.iteration + ' finished, ' + completedTerminology + ' ' + round(sprint.completed) + ' point' + pluralize(sprint.completed) + '<br/>' +
                round(this.y) + ' points remaining';
              if (seriesName === 'Actual') {
                html += '<br/>Actual velocity per day: ' + round(sprint.actual);
              }
              html += '<br/>' + sprint.team + ' team member' + pluralize(sprint.team) + ' for ' + round(sprint.duration) + ' day' + pluralize(sprint.duration) + '<br/>' +
                'Dates: ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.starts_on)) + ' - ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.completed_on));

            }
            return html;
          }
        },
        series: [{
          name: 'Trend',
          data: _(data.trend).map(function(d) { return [parseRubyDate(d.completed_on).getTime(), Number(d.points)]; }),
        }, {
          name: 'Projected',
          data: _(data.projected).map(function(d) { return [parseRubyDate(d.completed_on).getTime(), Number(d.points)]; }),
          dashStyle: 'LongDash'
        }, {
          name: 'Actual',
          data: _(data.actual).map(function(d) { return [parseRubyDate(d.completed_on).getTime(), Number(d.points)]; })
        }]
      });
      this.showOrHideBurnDownProjected();
    },

    burnDownProjectedCheckboxClicked: function() {
      $.cookie('stats_show_projected', this.$('#show-projected').is(':checked') ? 'yes' : 'no');
      this.showOrHideBurnDownProjected();
    },

    showOrHideBurnDownProjected: function() {
      if (this.$('#show-projected').is(':checked')) {
        this.burnDownChart.series[1].show();
      } else {
        this.burnDownChart.series[1].hide();
      }
    },

    displayBurnUp: function(data) {
      chart1 = new Highcharts.Chart({
        chart: {
          renderTo: 'burn-up-chart',
          type: 'area'
        },
        title: {
          text: 'Burn up'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e %b',
            year: '%b'
          }
        },
        yAxis: {
          title: {
             text: 'Points'
          }
        },
        colors: [
          '#0000FF',
          '#FF0000'
        ],
        tooltip: {
          formatter: function() {
            var dataSeries,
                that = this,
                sprint, pluralize,
                seriesName = this.series.name,
                html,
                lastSprint;

            switch(seriesName) {
              case 'Actual':
                dataSeries = data.actual;
                break;
              case 'Total':
                dataSeries = data.total;
            }

            sprint = _(dataSeries).find(function(elem) { return that.x === parseRubyDate(elem.starts_on).getTime(); });

            // // if rolling over last point of project, show the actual data instead as projected first point is misleading
            // if ( (dataSeries === data.projected) && (sprint === data.projected[0]) ) {
            //   dataSeries = data.actual;
            //   completedTerminology = 'completed';
            //   sprint = _(data.actual).last();
            //   seriesName = 'Actual';
            // }

            pluralize = function(val) { return val === 1 ? '' : 's'; },
            round = function(val) { return Math.max(0,Math.round(val * 10)/10); }

            html = '<b>'+ seriesName;
            if (sprint.iteration === 0) {
              lastSprint = _(data.actual).last();
              html += ' - end of sprint ' + lastSprint.iteration + '</b><br/>' +
                'Sprint ended on ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(lastSprint.completed_on)) + '<br/>'
              if (seriesName === 'Actual') {
                html += 'Completed ' + round(sprint.total_points) + ' point' + pluralize(sprint.total_points);
              } else {
                html += 'Total points to complete: ' + round(this.y);
              }
            } else {
              html += ' - Sprint ' + sprint.iteration + '</b><br/>';
              if (seriesName === 'Actual') {
                html += round(sprint.total_points) + ' point' + pluralize(sprint.total_points) + ' completed at the start' +
                  '<br/>Velocity this sprint: ' + round(sprint.completed) + ' point' + pluralize(sprint.completed) +
                  '<br/>Velocity per day: ' + round(sprint.actual) +
                  '<br/>' + sprint.team + ' team member' + pluralize(sprint.team) + ' for ' + round(sprint.duration) + ' day' + pluralize(sprint.duration);
              } else {
                html += 'Total points to complete: ' + round(this.y);
              }
              html += '<br />Dates: ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.starts_on)) + ' - ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.completed_on));
            }
            return html;
          }
        },
        series: [{
          name: 'Total',
          data: _(data.total).map(function(d) { return [parseRubyDate(d.starts_on).getTime(), Number(d.total_points)]; }),
        }, {
          name: 'Actual',
          data: _(data.actual).map(function(d) { return [parseRubyDate(d.starts_on).getTime(), Number(d.total_points)]; })
        }]
      });
    },

    displayVelocityCompleted: function(data) {
      chart1 = new Highcharts.Chart({
        chart: {
          renderTo: 'velocity-chart',
          type: 'column'
        },
        title: {
          text: 'Velocity of completed sprints'
        },
        xAxis: {
           categories: _(data).map(function(d) { return 'Sprint ' + d.iteration })
        },
        yAxis: {
          title: {
             text: 'Points'
          }
        },
        colors: [
          '#0000FF'
        ],
        tooltip: {
          formatter: function() {
            var that = this,
                sprint, pluralize,
                html;

            sprint = _(data).find(function(elem) { return that.x === 'Sprint ' + elem.iteration });

            pluralize = function(val) { return val === 1 ? '' : 's'; },
            round = function(val) { return Math.max(0,Math.round(val * 10)/10); }

            html = '<b>Sprint ' + sprint.iteration + '</b><br />' +
              'Completed ' + round(sprint.completed) + ' point' + pluralize(sprint.completed) +
              '<br/>Actual velocity per day: ' + round(sprint.actual) +
              '<br/>' + sprint.team + ' team member' + pluralize(sprint.team) + ' for ' + round(sprint.duration) + ' day' + pluralize(sprint.duration) + '<br/>' +
              'Dates: ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.starts_on)) + ' - ' + $.datepicker.formatDate($.datepicker._defaults.dateFormat, parseRubyDate(sprint.completed_on));

            return html;
          }
        },
        series: [{
          name: 'Total',
          data: _(data).map(function(d) { return d.completed })
        }]
      });
    },

    displayVelocityStats: function(data) {
      var expectedDay = data.expected_day,
          expectedSprint = data.expected_sprint,
          actualDay = data.actual_day,
          actualSprint = data.actual_sprint;

      this.$('#velocity-per-day-average').text(Math.round(actualDay*10)/10);
      this.$('#velocity-per-day-expected').text(Math.round(expectedDay*10)/10);
      this.$('#velocity-per-sprint-average').text(Math.round(actualSprint*10)/10);
      this.$('#velocity-per-sprint-expected').text(Math.round(expectedSprint*10)/10);

      this.$('.stats .average .notice').html('Your expected backlog daily velocity is configured as ' +
        (expectedDay == 1 ? '1 point' : expectedDay + ' points') +
        ' per day. <br/><a href="#backlog-settings" id="stats-backlog-settings-change">Change backlog settings &raquo;</a>');
    }
  })
};