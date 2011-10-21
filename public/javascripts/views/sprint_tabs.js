/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.SprintTabs = {
  Index: App.Views.BaseView.extend({
    childId: function(model) { return 'tab-sprint-' + model.get('id'); },
    isSettingsPage: false,
    models: {},

    events: {
      "click #add-sprint>a": "createNew"
    },

    initialize: function() {
      this.collection = this.options.collection;
      this.router = this.options.router;
      _.bindAll(this, 'showNew', 'getModelFromIteration', 'restoreTab');
    },

    render: function() {
      var view = this;
      this.isSettingsPage = $('#backlog-data-area').length == 0;

      var addTabView = function(model) {
        var tabView = new App.Views.SprintTabs.Show({ model: model, id: view.childId(model), router: view.router });
        view.$('ul.infinite-tabs').append(tabView.render().el);
        view.models[model.get('iteration')] = model;
      };

      // set up special pinned tabs
      var pinnedTabs = [{
        get: function() { return 'Backlog'; },
        active: true,
        locked: true
      }];
      if (!this.isSettingsPage) {
        pinnedTabs.push({
          get: function() { return 'Stats'; },
          locked: true
        });
      }

      // add special tabs + sprints
      _(pinnedTabs).each(addTabView);
      _(this.collection.sortBy(function(model) { return -model.get('id'); })).each(addTabView);

      if (!this.isSettingsPage) {
        // lets set the UL width as it is not auto-sized as position is fixed, and then resize as the document is resized
        var totalTabWidth = ($('#backlog-data-area .backlog-stats').offset().left - $(view.el).offset().left - 10);
        var windowWidth = $(window).width();
        $(view.el).css('width', totalTabWidth + 'px');
        $(window).resize(function() {
          var resizeWidthBy = $(window).width() - windowWidth;
          if (resizeWidthBy) {
            totalTabWidth += resizeWidthBy;
            windowWidth = $(window).width();
            $(view.el).css('width', totalTabWidth + 'px');
          }
        });

        // fix the slight variances in the DOM where the tab system is one pixel too high or low
        $(this.el).css('top', ($('#themes-header').offset().top - $(this.el.find('ul li:first')).outerHeight()) + 'px');
      }

      // set up the infinity tabs JQuery plugin so that tabs scroll
      view.$('ul.infinite-tabs').infiniteTabs();

      return this;
    },

    getModelFromIteration: function(iteration) {
      return this.models[iteration];
    },

    // show the new sprint model added to collection
    showNew: function(model) {
      var tabView = new App.Views.SprintTabs.Show({ model: model, id: this.childId(model), router: this.router });
      $(this.el).find('li.scroller ul').prepend(tabView.render().el);
      $(tabView.render().el).click();
      $(this.el).find('ul.infinite-tabs').infiniteTabs('check-for-resize'); // may need a scroll bar now so check
    },

    // select the tab represented by this model
    select: function(model) {
      this.$('li#' + this.childId(model)).click();
    },

    // restore tab back to previous state i.e. when user cancels a tab change because of changes
    restoreTab: function(iteration) {
      var model = this.getModelFromIteration(iteration);
      var thisTab = this.$('li#' + this.childId(model));
      thisTab.parents('.infinite-tabs').find('li').removeClass('active');
      thisTab.addClass('active');
    },

    destroy: function(model, callback) {
      var view = this;
      this.$('li#' + this.childId(model)).remove();
      $(this.el).find('ul.infinite-tabs').infiniteTabs('check-for-resize'); // may not need a scroll bar now so check

      if (model.get('iteration') > 1) {
        // reload the next in line tab as some settings will have changed now that it's the latest sprint (i.e. deletable? = true)
        this.models[model.get('iteration') - 1].fetch({
          success: function(previousModel) {
            view.router.navigate(String(previousModel.get('iteration')), true);
            if (_.isFunction(callback)) { callback() };
          },
          failure: function() {
            new App.Views.Error({ message: 'Internal error, unable to refresh sprint data.  Please refresh your browser'});
            view.router.navigate(String(previousModel.get('iteration')), true);
            if (_.isFunction(callback)) { callback() };
          }
        })
      } else {
        this.router.navigate('Backlog', true);
        if (_.isFunction(callback)) { callback() };
      }
    },

    createNew: function(event) {
      var view = this;
      event.preventDefault();
      $('#dialog-new-sprint').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['sprints/new-dialog']({ sprints: this.collection }));
      $('#dialog-new-sprint').dialog({
        resizable: false,
        height:350,
        width: 400,
        modal: true,
        buttons: {
          Create: function() {
            var dialog = $(this);

            // check that client side validation reports no problems
            if (!dialog.find('form').valid()) {
              $(dialog).find('p.intro').addClass('error').html("One or more fields are not completed correctly.  Please correct these to continue.");
              return false;
            }

            // update the dialog to say we're updating and then close after a short period
            $(this).find('p.progress-placeholder').html('Please wait, creating new sprint...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').hide();

            var model = new Sprint({
              start_on: $.datepicker.formatDate('yy-mm-dd', dialog.find('#start-on').datepicker('getDate')),
              duration_days: dialog.find('#duration-days').val(),
              number_team_members: dialog.find('#number-team-members').val()
            })
            view.collection.add(model);
            model.save(false, {
              success: function(model, response) {
                view.showNew(model);
                new App.Views.Notice({ message: 'Sprint number ' + model.get('iteration') + ' has been added'});
                $(dialog).dialog("close");
              },
              error: function(model, error) {
                if (window.console) { console.log(JSON.stringify(error)); }
                if ($(dialog).is(':visible')) {
                  $(dialog).find('p.intro').addClass('error').html("Oops, we could not create a sprint as it looks like you haven't filled in everything correctly:<br>" +
                    JSON.parse(error.responseText).message);
                  $(dialog).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Cancel');
                  $(dialog).parent().find('.ui-dialog-buttonset button:nth-child(1)').show();
                  $(dialog).find('p.progress-placeholder').html('');
                } else {
                  // dialog has since been closed, show an error in usual notice area
                  var errorView = new App.Views.Error({ message: 'Sprint was not created, please try again'});
                }
                view.collection.remove(model);
              }
            });
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });

      var dialog = $('#dialog-new-sprint');
      dialog.find('#start-on').datepicker();

      // check that validation plugin is loaded as it is loaded only when document.ready
      if (_.isFunction($.fn.validate)) {
        dialog.find('form').validate({
          rules: {
            duration_days: {
              required: true,
              digits: true,
              min: 1
            },
            number_team_members: {
              required: true,
              digits: true,
              min: 1
            }
          },
          messages: {
            duration_days: {
              required: 'Sprint duration is required',
              digits: 'Enter a value using whole numbers only',
              min: 'Sprint duration must be at least 1 day'
            },
            number_team_members: {
              required: 'Number of team members is required',
              digits: 'Enter a value using whole numbers only',
              min: 'Team must comprise of at least one member'
            }
          }
        });
      }

      // set sensible defaults for new sprint based on previous sprints (if they exist)
      if (this.collection.length == 0) {
        // first sprint, assume some defaults
        dialog.find('#start-on').datepicker("setDate", new Date(new Date().getTime() + 1000 * 60 * 60 * 24));
        dialog.find('#duration-days').val('10');
        dialog.find('#number-team-members').val('1');
      } else if (this.collection.length == 1) {
        // we have one previous sprint so we can make some assumptions
        var dayInMs = 1000 * 60 * 60 * 24,
            lastSprint = this.collection.at(0),
            lastDate = parseRubyDate(lastSprint.get('start_on')).getTime(),
            lastDuration = Number(lastSprint.get('duration_days')),
            nextDate = lastDate + ((lastDuration+1) * dayInMs) + (Math.floor(lastDuration / 5) * 2 * dayInMs); // next sprint starts next day plus account for weekends every 5 days
        dialog.find('#start-on').datepicker("setDate", new Date(nextDate));
        dialog.find('#duration-days').val(lastDuration);
        dialog.find('#number-team-members').val(lastSprint.get('number_team_members'));
      } else {
          // we have one previous sprint so we can make some assumptions
        var dayInMs = 1000 * 60 * 60 * 24,
            sprintsDesc = this.collection.sortBy(function(sprint) { return sprint.get('iteration'); }).reverse(),
            lastSprint = sprintsDesc[0],
            previousSprint = sprintsDesc[1],
            timePassedBetweenDates = parseRubyDate(lastSprint.get('start_on')).getTime() - parseRubyDate(previousSprint.get('start_on')).getTime(),
            nextDate = parseRubyDate(lastSprint.get('start_on')).getTime() + timePassedBetweenDates;
        dialog.find('#start-on').datepicker("setDate", new Date(nextDate));
        dialog.find('#duration-days').val(lastSprint.get('duration_days'));
        dialog.find('#number-team-members').val(lastSprint.get('number_team_members'));
      }
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'sprint-tab',

    events: {
      "click a": "activate"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      this.router = this.options.router;
      this.parentView = this.options.parentView
      _.bindAll(this, 'remove');
    },

    render: function() {
      $(this.el).html( JST['sprints/tabs/show']({ model: this.model }) );
      if (this.model.active) { $(this.el).addClass('active'); }
      if (this.model.locked) { $(this.el).addClass('locked'); }
      return this;
    },

    activate: function() {
      $(this.el).parents('.infinite-tabs').find('li').removeClass('active');
      $(this.el).addClass('active');
      this.router.navigate(String(this.model.get('iteration')), true);
    }
  })
};