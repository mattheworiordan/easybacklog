/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogStats = {
  Show: App.Views.BaseView.extend({
    events: {
      "click a#stats-backlog-settings-change": "backlogSettings"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);

      // _.bindAll(this);
    },

    render: function() {
      var that = this;
      $(this.el).html(JST['backlogs/sprint-progress-stats']({ model: this.model }));
      that.waitUntilChartsLoaded(function() {
        that.showCharts();
      });
      return this;
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
        (function() {
          that.$('.loading').hide();
          that.$('.stats').show();
          that.$('.no-stats').hide();
          that.displayBurnDown();
          that.displayBurnUp();
          that.displayVelocity();
          that.displayAverageVelocity();
        })();
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

    displayBurnDown: function() {
      chart1 = new Highcharts.Chart({
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
          }
        },
        colors: [
          '#FF0000',
          '#0000FF',
        ],
        tooltip: {
           formatter: function() {
                     return '<b>'+ this.series.name +'</b><br/>'+
                 $.datepicker.formatDate($.datepicker._defaults.dateFormat, new Date(this.x)) + ': '+ this.y + ' pts';
           }
        },
        series: [{
          name: 'Trend',
          data: [
            [Date.UTC(2011,  00, 01), 200],
            [Date.UTC(2011, 00, 15), 160 ],
            [Date.UTC(2011, 00, 29), 130 ],
            [Date.UTC(2011, 01, 13), 100 ],
            [Date.UTC(2011, 01, 27), 60 ],
            [Date.UTC(2011, 02, 10), 40 ],
            [Date.UTC(2011, 02, 24), 0 ]
          ]
        }, {
          name: 'Actual',
          data: [
            [Date.UTC(2011,  00, 01), 200, 'Sprint 1'],
            [Date.UTC(2011, 00, 15), 170 ],
            [Date.UTC(2011, 00, 29), 135 ],
            [Date.UTC(2011, 01, 13), 95 ],
            [Date.UTC(2011, 01, 27), 60 ],
            [Date.UTC(2011, 02, 10), 45 ],
            [Date.UTC(2011, 02, 24), 25 ]
          ]
        }]
      });
    },

    displayBurnUp: function() {
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
                     return '<b>'+ this.series.name +'</b><br/>'+
                 $.datepicker.formatDate($.datepicker._defaults.dateFormat, new Date(this.x)) + ': '+ this.y + ' pts';
           }
        },
        series: [{
          name: 'Total',
          data: [
            [Date.UTC(2011,  00, 01), 160],
            [Date.UTC(2011, 00, 15), 160 ],
            [Date.UTC(2011, 00, 29), 180 ],
            [Date.UTC(2011, 01, 13), 190 ],
            [Date.UTC(2011, 01, 27), 200 ],
            [Date.UTC(2011, 02, 10), 190 ],
            [Date.UTC(2011, 02, 24), 190 ]
          ]
        }, {
          name: 'Actual',
          data: [
            [Date.UTC(2011,  00, 01), 0, 'Sprint 1'],
            [Date.UTC(2011, 00, 15), 20 ],
            [Date.UTC(2011, 00, 29), 50 ],
            [Date.UTC(2011, 01, 13), 70 ],
            [Date.UTC(2011, 01, 27), 90 ],
            [Date.UTC(2011, 02, 10), 120 ],
            [Date.UTC(2011, 02, 24), 150 ]
          ]
        }]
      });
    },

    displayVelocity: function() {
      chart1 = new Highcharts.Chart({
        chart: {
          renderTo: 'velocity-chart',
          type: 'column'
        },
        title: {
          text: 'Velocity'
        },
        xAxis: {
           categories: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6', 'Sprint 7']
        },
        yAxis: {
          title: {
             text: 'Points'
          }
        },
        colors: [
          '#0000FF'
        ],
        series: [{
          name: 'Total',
          data: [30,30,35,25,35,30,25]
        }]
      });
    },

    displayAverageVelocity: function() {
      var velocityDay = 2.7,
          velocitySprint = 28,
          pointsPerDay = 3;

      this.$('#stat-day').text('Velocity (day): ' + Math.round(velocityDay*10)/10);
      this.$('#stat-sprint').text('Velocity (sprint): ' + Math.round(velocitySprint));
      this.$('.stats .average .notice').html('Your backlog daily velocity is configured as ' +
        (pointsPerDay == 1 ? '1 point' : pointsPerDay + ' points') +
        ' per day. <br/><a href="#backlog-settings" id="stats-backlog-settings-change">Change backlog settings &raquo;</a>');
    },

    activated: function() {
      this.showCharts();
    }
  })
};