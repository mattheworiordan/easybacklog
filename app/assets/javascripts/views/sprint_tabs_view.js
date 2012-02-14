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
      this.isSnapshot = $('.not-editable-backlog-notice.snapshot').length >= 1 ? true : false;

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
      if (!this.isSettingsPage && !this.isSnapshot) {
        pinnedTabs.push({
          get: function() { return 'Stats'; },
          locked: true
        });
      }
      if (!this.isSettingsPage && !this.collection.length && !this.isSnapshot) {
        pinnedTabs.push({
          get: function() { return 'Sprints'; }
        });
      }

      // add special tabs + sprints
      _(pinnedTabs).each(addTabView);
      _(this.collection.sortBy(function(model) { return -model.get('id'); })).each(addTabView);

      if (!this.isSettingsPage) {
        this.adjustTabConstraints();

        // fix the slight variances in the DOM where the tab system is one pixel too high or low
        $(this.el).css('top', ($('#themes-header').offset().top - $(this.el.find('ul li:first')).outerHeight()) + 'px');
      }

      // set up the infinity tabs JQuery plugin so that tabs scroll
      view.$('ul.infinite-tabs').infiniteTabs();

      return this;
    },

    adjustTabConstraints: function(resizeExpected) {
      var that = this;
      // set the UL width as it is not auto-sized as position is fixed, and then resize as the document is resized
      this.totalTabWidth = $('#backlog-data-area .backlog-stats').offset().left - $(this.el).offset().left;
      this.windowWidth = $(window).width();
      $(this.el).css('width', this.totalTabWidth + 'px');

      if (resizeExpected) {
        $(this.el).find('ul.infinite-tabs').infiniteTabs('adjust-to-fit');
      }

      if (!this.resizeEventAdded) {
        this.resizeEventAdded = true;
        $(window).resize(function() {
          var resizeWidthBy = $(window).width() - that.windowWidth;
          if (resizeWidthBy) {
            that.totalTabWidth += resizeWidthBy;
            that.windowWidth = $(window).width();
            $(that.el).css('width', that.totalTabWidth + 'px');
          }
        });
      }
    },

    getModelFromIteration: function(iteration) {
      return this.models[iteration];
    },

    // show the new sprint model added to collection
    showNew: function(model) {
      this.models[model.get('iteration')] = model; // add to models cache

      // add new view HTML to DOM
      var tabView = new App.Views.SprintTabs.Show({ model: model, id: this.childId(model), router: this.router });
      this.$('ul.infinite-tabs').infiniteTabs('prepend-tab', tabView.render().el);

      // Sprints help tab is visible, let's hide it as we only want it when a sprint does not yet exist
      if (this.models['Sprints']) {
        this.$('ul.infinite-tabs').infiniteTabs('remove-tab', this.$('li#' + this.childId(this.models['Sprints'])));
        delete this.models['Sprints'];
      }

      // call the router to navigate to this tab
      this.router.navigate(model.get('iteration').toString(), true);
    },

    // select the tab represented by this model
    select: function(model) {
      var infinityTab = this.$('ul.infinite-tabs'),
          currentActive = this.$('li.active');
      if (currentActive.length) {
        infinityTab.infiniteTabs('set-tab-content', currentActive, currentActive.find('a').html().replace(/^\s*Sprint (\d+)\s*$/, '$1'));
      }
      var tab = this.$('li#' + this.childId(model))
      tab.parents('.infinite-tabs').find('li').removeClass('active');
      tab.addClass('active');
      infinityTab.infiniteTabs('set-tab-content', tab, tab.find('a').html().replace(/^\s*(\d+)\s*$/, "Sprint $1"));
    },

    // restore tab back to previous state i.e. when user cancels a tab change because of changes
    restoreTab: function(iteration) {
      var model = this.getModelFromIteration(iteration);
      this.select(model);
    },

    destroy: function(model, callback) {
      var view = this;
      this.$('ul.infinite-tabs').infiniteTabs('remove-tab', this.$('li#' + this.childId(model)));
      delete this.models[model.get('iteration')];

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
      var view = this,
          backlogVelocity = this.collection.backlog.get('velocity');

      event.preventDefault();

      $('#dialog-new-sprint').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/sprints/new-dialog']({
        sprints: this.collection,
        backlog: this.collection.backlog
      }));

      $('#dialog-new-sprint').dialog({
        resizable: false,
        height: backlogVelocity ? 400 : 285, // if no estimate by points per day option, then dialog is a lot smaller
        width: 470,
        modal: true,
        buttons: {
          Create: function() {
            var dialog = $(this), modelData, model;

            // check that client side validation reports no problems
            if (!dialog.find('form').valid()) {
              $(dialog).find('p.intro').addClass('error').html("One or more fields are not completed correctly.  Please correct these to continue.");
              return false;
            }

            // update the dialog to say we're updating and then close after a short period
            $(this).find('p.progress-placeholder').html('Please wait, creating new sprint...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').hide();

            modelData = {
              start_on: $.datepicker.formatDate('yy-mm-dd', dialog.find('#start-on').datepicker('getDate')),
              duration_days: dialog.find('#duration-days').val()
            }
            if (!backlogVelocity || dialog.find('#use-explicit-velocity').is(':checked')) {
              modelData['explicit_velocity'] = dialog.find('#explicit-velocity').val();
            } else {
              modelData['number_team_members'] = dialog.find('#number-team-members').val();
            }
            model = new Sprint(modelData);

            if (view.collection.length === 0) {
              // first sprint is being added, store the user's duration in days for a sprint so that
              // we default to this next time
              $.cookie('sprint_duration', model.get('duration_days'));
            }

            view.collection.add(model);
            model.save(false, {
              success: function(model, response) {
                view.showNew(model);
                new App.Views.Notice({ message: 'Sprint number ' + model.get('iteration') + ' has been added'});
                $(dialog).dialog("close");
              },
              error: function(model, error) {
                var errorMessage;
                if (window.console) { console.log(JSON.stringify(error)); }
                if ($(dialog).is(':visible')) {
                  try {
                    errorMessage = JSON.parse(error.responseText).message;
                    $(dialog).find('p.intro').addClass('error').html("Oops, we could not create a sprint as it looks like you haven't filled in everything correctly:<br>" + errorMessage);
                  } catch (e) {
                    $(dialog).find('p.intro').addClass('error').html("Oops, something has gone wrong and we could not create the sprint.  Please try again.");
                    if (window.console) { console.log(e); }
                  }
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
      dialog.find('#start-on').blur().datepicker(); // blur first so that when user clicks on date picker the date picker shows

      // check that validation plugin is loaded as it is loaded only when document.ready
      if (_.isFunction($.fn.validate)) {
        dialog.find('form').validate(App.Views.SharedSprintSettings.formValidationConfig);
      }

      var dayInMs = 1000 * 60 * 60 * 24,
          shiftToNextWeekday = function(dateInMs) {
            var date = new Date(dateInMs);
            switch (date.getDay()) {
              case 0:
                return dateInMs + dayInMs;
              case 6:
                return dateInMs + (dayInMs * 2);
            }
            return dateInMs;
          };

      // set sensible defaults for new sprint based on previous sprints (if they exist)
      if (this.collection.length === 0) {
        // first sprint, assume some defaults
        dialog.find('#start-on').datepicker("setDate", new Date(new Date().getTime() + 1000 * 60 * 60 * 24));
        dialog.find('#duration-days').val(!isNaN(parseInt($.cookie('sprint_duration'))) ? $.cookie('sprint_duration') : 10);
        dialog.find('#number-team-members').val('1');
      } else if (this.collection.length == 1) {
        // we have one previous sprint so we can make some assumptions
        var lastSprint = this.collection.at(0),
            lastDate = parseRubyDate(lastSprint.get('start_on')).getTime(),
            lastDuration = Number(lastSprint.get('duration_days')),
            nextDate = lastDate + (lastDuration * dayInMs) + (Math.floor(lastDuration / 5) * 2 * dayInMs); // next sprint starts next day plus account for weekends every 5 days
        dialog.find('#start-on').datepicker("setDate", new Date(shiftToNextWeekday(nextDate)));
        dialog.find('#duration-days').val(lastDuration);
        dialog.find('#number-team-members').val(niceNum(lastSprint.get('number_team_members')));
        dialog.find('#explicit-velocity').val(niceNum(lastSprint.get('explicit_velocity')));
      } else {
        // we have more than one previous sprint so we can make some assumptions
        var sprintsDesc = this.collection.sortBy(function(sprint) { return sprint.get('iteration'); }).reverse(),
            lastSprint = sprintsDesc[0],
            previousSprint = sprintsDesc[1],
            lastDate = parseRubyDate(lastSprint.get('start_on')).getTime(),
            lastDuration = Number(lastSprint.get('duration_days')),
            timePassedBetweenDates = parseRubyDate(lastSprint.get('start_on')).getTime() - parseRubyDate(previousSprint.get('start_on')).getTime(),
            nextDateByDuration = lastDate + (lastDuration * dayInMs) + (Math.floor(lastDuration / 5) * 2 * dayInMs), // next sprint starts next day plus account for weekends every 5 days
            nextDateByTimeBetweenSprints = lastDate + timePassedBetweenDates,
            nextDate = Math.max(nextDateByDuration, nextDateByTimeBetweenSprints);
        dialog.find('#start-on').datepicker("setDate", new Date(shiftToNextWeekday(nextDate)));
        dialog.find('#duration-days').val(lastSprint.get('duration_days'));
        dialog.find('#number-team-members').val(niceNum(lastSprint.get('number_team_members')));
        dialog.find('#explicit-velocity').val(niceNum(lastSprint.get('explicit_velocity')));
      }

      App.Views.SharedSprintSettings.addFormBehaviour(dialog, backlogVelocity);
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
      $(this.el).html( JST['templates/sprints/tabs/show']({ model: this.model }) );
      if (this.model.active) { $(this.el).addClass('active'); }
      if (this.model.locked) { $(this.el).addClass('locked'); }
      return this;
    },

    activate: function() {
      this.router.navigate(String(this.model.get('iteration')), true);
    }
  })
};