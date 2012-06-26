/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, Theme:false, multiLineHtmlEncode:false */

App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",

    /* list of items that are hidden whilst re-ordering, don't slide up already collapsed theme elements */
    reorderSlideUpElements: 'ul.stories,.theme-stats,ul.themes li.theme:not(.collapsed) .theme-actions,ul.themes li.theme:not(.collapsed) .theme-data .code,ul.themes>li.actions',

    childId: function(model) { return 'theme-' + model.get('id'); },

    events: {
      "click ul.themes .actions a.new-theme"        : "createNew",
      "keydown ul.themes .actions a.new-theme"      : "themeKeyPress",
      "click ul.themes .actions a.reorder-themes"   : "startReorder",
      "keydown ul.themes .actions a.reorder-themes" : "themeKeyPress",
      "click .stop-ordering a"                      : "stopReorder"
    },

    initialize: function() {
      this.collection = this.options.collection;
      _.bindAll(this, 'orderChanged');
    },

    render: function() {
      var that = this;
      $(this.el).html(JST['templates/themes/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Themes.Show(App.Views.Helpers.addUseOptions({ model: model, id: that.childId(model) }, that.options));
        that.$('>ul').append(view.render().el);
      });

      this.$('ul.themes').append(JST['templates/themes/new']());

      if (this.collection.backlog.IsEditable()) {
        var orderChangedEvent = this.orderChanged;
        var actionsElem;
        var moveThemeTitle;
        // allow themes to be sorted using JQuery UI
        this.$('ul.themes').sortable({
          start: function(event, ui) {
          },
          stop: function(event, ui) {
            orderChangedEvent();
          },
          placeholder: 'target-order-highlight',
          axis: 'y',
          handle: '.move-theme'
        }).find('.move-theme').disableSelection();
      } else {
        this.$('ul.themes>li.actions').remove();
      }
      return(this);
    },

    /* Start re-ordering of themes, slide up all unnecessary fields */
    startReorder: function(event) {
      event.preventDefault();
      if ($('ul.themes li.theme').length < 2) {
        var errorView = new App.Views.Warning({ message: 'You need more than one theme to reorder'});
      } else {
        var that = this;
        this.$(this.reorderSlideUpElements).slideUp(250, function() {
          that.$('li.theme').addClass('being-ordered');
          that.$('.stop-ordering').css('display', 'block'); // show the stop ordering button
        });
      }
    },

    stopReorder: function(event) {
      event.preventDefault();
      this.$('li.theme').removeClass('being-ordered');
      this.$('.stop-ordering').css('display', 'none'); // hide the stop ordering button
      this.$(this.reorderSlideUpElements).slideDown(250, function() {
        $(this).css('display','');
      });
    },

    createNew: function(event) {
      event.preventDefault();
      var model = new Theme();
      this.collection.add(model);
      this.$('ul.themes li:last').before(new App.Views.Themes.Show(App.Views.Helpers.addUseOptions({ model: model }, this.options)).render().el);
      var that = this;
      this.$('ul.themes li.theme:last').css('display','none').slideDown('fast', function() {
        $(that.el).find('ul.themes li.theme:last>.theme-data .name .data').click();
      });
    },

    // New or Re-order button press
    themeKeyPress: function(event) {
      var target = $(event.target);
      if (9 === event.keyCode) { // tab pressed
        event.preventDefault();
        if (!event.shiftKey) { // --> moving forward
          if (target.is('a.new-theme')) { // user on add theme button
            this.$('a.reorder-themes').focus();
          } else if (target.is('a.reorder-themes')) {
            $('#backlog-data-area h2.name .data').click(); // focus on backlog name, we're at the last element
          }
        } else { // <-- moving back
          if (target.is('a.new-theme')) { // user on new theme button
            if (this.$('li.theme').length > 0) { // one or more themes exist
              var lastTheme = $('li.theme:last');
              if (lastTheme.has('li.actions a.new-story').length) {
                lastTheme.find('li.actions a.new-story').focus(); // go to add story button of last theme
              } else {
                lastTheme.find('.theme-data .name .data').click(); // no new story button exists, focus on theme name
              }
            } else {
              // do nothing as we don't have anywhere to take the user
            }
          } else if (target.is('a.reorder-themes')) {
            this.$('a.new-theme').focus();
          }
        }
      } else if (13 === event.keyCode) { // enter pressed
        if (target.is('a.new-theme')) {
          this.createNew(event);
        } else if (target.is('a.reorder-themes')) {
          this.startReorder(event);
        }
      }
    },

    // method is called after JQuery UI re-ordering
    orderChanged: function() {
      var orderIndexesWithIds = {};
      this.$('li.theme').each(function(index, elem) {
        var elemId = _.last($(elem).attr('id').split('-'));
        if (!isNaN(parseInt(elemId, 10))) { // unless story is new and not saved yet
          orderIndexesWithIds[elemId] = index + 1;
        }
      });
      if (window.console) { console.log('Order changed and saving - ' + JSON.stringify(orderIndexesWithIds)); }
      this.collection.saveOrder(orderIndexesWithIds);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'theme',
    deleteDialogTemplate: 'templates/themes/delete-dialog',

    events: {
      "click .delete-theme>a": 'remove',
      "click .re-number-stories a": 'reNumberStories',
      "click .re-order-themes a": 'reOrderThemes',
      "click .assign-stories-sprint a": 'assignStoriesToSprint',
      "click .move-theme a": 'moveToAnotherBacklog',
      "click .theme-collapse-icon a, .container .collapsed-title": 'expandCollapse'
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'navigateEvent', 'reNumberStoriesAction', 'updateThemeViewAfterExpandOrCollapse');
    },

    render: function() {
      var view, that = this;
      $(this.el).html( JST['templates/themes/show']({ model: this.model }) );
      view = new App.Views.Stories.Index(App.Views.Helpers.addUseOptions({ collection: this.model.Stories() }, this.options));
      this.$('>.stories').prepend(view.render().el);

      this.updateStatistics();

      if (this.model.IsEditable()) {
        this.makeFieldsEditable();
        App.Views.Helpers.enableActionMenu(this, '.theme-actions');
      } else {
        this.$('ul.stories>li.actions').remove();
        this.$('.theme-actions .action-menu-icon').remove();

        // only show warnings about user's ability to edit if the backlog itself is not locked anyway such as an archive or snapshot
        if (!this.model.IsLocked()) {
          // make all editable fields show warning that item is not editable by this user
          _.each(['.theme-data .name div.data','.theme-data .code div.data'], function(elem) {
            that.$(elem).click(function() {
              new App.Views.Warning({ message: 'You do not have permission to edit themes for this backlog' });
            });
          });
        }
      }

      // if children stories are filtered, a change:meta_story_filter event is fired on the theme so the stats can be updated if necessary
      this.model.bind('change:meta_story_filter', function() {
        that.updateThemeViewAfterExpandOrCollapse();
      });

      // check if collapsed
      if (this.model.Backlog().UserSettings().isCollapsedTheme(this.model.get('id'))) {
        _.delay(function() { that.expandCollapse({ doNotPersistChange: true }); }, 100);
      }
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function(value, settings) {
        var newVal = show_view.contentUpdated(value, settings, this);
        var fieldId = $(this).parent().attr('class').replace(/\-/g, '_');
        if (fieldId === 'code') { // code needs updating of story views
          show_view.model.Stories().each(function(story, index) {
            story.trigger('change:unique_id'); // trigger unique ID change so field is updated
          });
        }
        return (newVal);
      };
      var beforeChangeFunc = function(value, settings) { return show_view.beforeChange(value, settings, this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), {
        data: beforeChangeFunc,
        onKeyDown: show_view.navigateEvent // make all input and textarea fields respond to Tab/Enter
      });

      this.$('.theme-data .name div.data').editable(contentUpdatedFunc, _.extend(_.clone(defaultOptions), { maxLength: 100 }) );
      this.$('.theme-data .code div.data').editable(contentUpdatedFunc, _.extend(_.clone(defaultOptions), { widen: 8, maxLength: 3 }) );
    },

    // Tab or Enter key pressed so let's move on
    navigateEvent: function(event) {
      var storyElem, thisThemeAddStory, target, dataField, prev;

      if (_.include([9,13,27], event.keyCode)) { // tab, enter, esc
        try { // cannot preventDefault if esc as esc event is triggered manually from jeditable
          event.preventDefault();
        } catch (e) { }

        // Behaviour for Theme view name / code field
        if (!event.shiftKey) { // going -->
          $(event.target).blur();
          // currently on theme name field
          storyElem = $(this.el).find('li.story:not(.locked):first:visible');
          if (storyElem.length) {
            // move to story item
            App.Views.Helpers.scrollIntoBacklogView(storyElem.find('.unique-id .data'), function(elem) {
              elem.click();
            });
          } else {
            // focus on next theme button if next theme li holds add theme & reorder theme buttons
            $(this.el).next().find('a.new-theme').focus();
            thisThemeAddStory = $(this.el).find('ul.stories li.actions:not(.locked):visible a.new-story');
            if (thisThemeAddStory.length) {
              // and if a new story button exists move focus to that, takes precedence over new theme button from above
              App.Views.Helpers.scrollIntoBacklogView(thisThemeAddStory, function(elem) {
                elem.focus();
              });
            } else {
              // active next theme's text field if that exists, typically happens if this theme is empty and no new story button exists (caught in next step)
              App.Views.Helpers.scrollIntoBacklogView($(this.el).next().find('.theme-data > .name .data'), function(elem) {
                elem.click();
              });
            }
          }
        } else { // going <--
          dataField = $(event.target).parents('.data');
          if (dataField.parent().hasClass('name')) { // on theme name field
            prev = $(this.el).prev(); // previous theme
            if (prev.length) { // previous theme exists
              target = prev.find('ul.stories li.actions:not(.locked):visible a.new-story');
              if (target.length) {
                $(event.target).blur();
                App.Views.Helpers.scrollIntoBacklogView(target, function(elem) {
                  elem.focus();
                });
              } else {
                $(event.target).blur();
                App.Views.Helpers.scrollIntoBacklogView(prev.find('.theme-data >.name .data'), function(elem) {
                  elem.click();
                });
              }
            } else {
              // no previous theme, do nothing, leave field focussed
              _.delay(function() { dataField.click(); }, 200);
            }
          } else {
            // focus was on code field, just go back to name field
            $(event.target).blur();
            this.$('.theme-data >.name .data').click();
          }
        }
      }
    },

    changeEvent: function(eventName, model) {
      if ((eventName.substring(0,7) === 'change:') && (eventName !== 'change:meta_story_filter')) {
        var fieldChanged = eventName.substring(7);
        this.$('>.theme-data>.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
        this.updateStatistics(); // force update in case name has changed
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
      }
      if (eventName === 'change:id') {
        $(this.el).attr('id', 'theme-' + model.get('id'));
        if (!this.$('ul.stories li.actions .new-story').length) {
          // not yet added the Add Story button as theme not created so add now
          if (!this.model.isNew()) {
            this.$('.stories ul.stories').append(JST['templates/stories/new']()).find('.actions a').focus();
          }
        }
      }
    },

    deleteAction: function(dialog_obj, view) {
      var model_collection = view.model.collection;

      // tell the user we're deleting as it may take a second
      $(dialog_obj).find('>p').html('Deleting theme...<br /><br />Please wait.');
      $(dialog_obj).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Close');
      $(dialog_obj).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
      view.model.destroy({
        error: function(model, response) {
          var errorMessage = 'Unable to delete story...';
          try {
            errorMessage = $.parseJSON(response.responseText).message;
          } catch (e) { if (window.console) { console.log(e); } }
          var errorView = new App.Views.Error({ message: errorMessage});
          $(dialog_obj).dialog("close"); // hide the dialog
        },
        success: function(model, response) {
          model_collection.remove(view.model);
          $(view.el).remove(); // remove HTML for story
          $(dialog_obj).dialog("close"); // hide the dialog
          App.Controllers.Statistics.updateStatistics(response.score_statistics);
        }
      });
    },

    updateStatistics: function() {
      this.$('.theme-stats div').html( JST['templates/themes/stats'](App.Views.Helpers.addUseOptions({ model: this.model }, this.options)) );
      this.updateThemeViewAfterExpandOrCollapse(); // ensure that if updates occur to the theme then any collapsed or expanded view changes are retained
    },

    reNumberStories: function(event) {
      var view = this;
      event.preventDefault();
      $('#dialog-re-number').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/themes/re-number-dialog']({ }));
      $('#dialog-re-number').dialog({
        resizable: false,
        height:170,
        modal: true,
        buttons: {
          'Re-number': function() {
            view.reNumberStoriesAction(this);
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    },

    reNumberStoriesAction: function(dialog) {
      var view = this;
      // tell the user we're deleting as it may take a second
      $(dialog).find('>p').html('Re-numbering stories...<br />Please wait.<br /><br /><span class="progress-icon"></span>');
      $(dialog).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Close');
      $(dialog).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
      view.model.ReNumberStories({
        success: function() {
          $(dialog).dialog("close");
        },
        error: function(event) {
          var errorMessage = 'Server error trying to renumber stories. Please reload this page.';
          try {
            errorMessage = $.parseJSON(event.responseText).message;
            new App.Views.Error({ message: errorMessage});
          } catch (e) {
            if (window.console) { console.log(e); }
            new App.Views.Error({ message: errorMessage});
          }
          $(dialog).dialog("close"); // hide the dialog
        }
      });
    },

    reOrderThemes: function() {
      $('ul.themes .actions a.reorder-themes:first').trigger('click');
    },

    assignStoriesToSprint: function() {
      var view = this,
          sprints = this.model.Backlog().Sprints(),
          incompleteSprints = sprints.reject(function(sprint) { return sprint.IsComplete(); }),
          stories = this.model.Stories(),
          unassignedStories = stories.reject(function(story) { return story.SprintStory(); });

      if (sprints.length === 0) {
        new App.Views.Warning({ message: 'You have not created any sprints yet.<br>Click on the Sprints tab to add a sprint first.'});
      } else if (incompleteSprints.length === 0) {
        new App.Views.Warning({ message: 'All sprints are marked as complete.<br>You need to add a new sprint before you can assign this story.'});
      } else if (unassignedStories.length === 0) {
        new App.Views.Warning({ message: 'All stories are already assigned to a sprint.<br>Batch assigning can only be executed on stories not assigned to sprints.'});
      } else {
        $('#dialog-assign-sprint').remove(); // ensure old dialog HTML is not still in the DOM
        $('body').append(JST['templates/themes/assign-sprint-dialog']({ theme: this.model, unassignedStories: unassignedStories, sprints: _(incompleteSprints).sortBy(function(sprint) { return sprint.get('iteration'); }).reverse() }));
        $('#dialog-assign-sprint').dialog({
          resizable: false,
          height:240,
          modal: true,
          buttons: {
            Assign: function() {
              var sprintId = $(this).find('#sprint-target').val(),
                  assignedStories = 0,
                  sprint,
                  dialog = this,
                  sprintStory;

              if (!sprintId) {
                $(this).find('div.error-message').html('<p>You must select a sprint first.</p>');
              } else {
                $(this).find('div.error-message').html('');
                $(this).find('.progress-placeholder').html('<p>Please wait while we assign the stories...</p>');
                $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Working...');
                $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').hide();

                sprint = view.model.Backlog().Sprints().get(Number(sprintId));

                _(unassignedStories).each(function(story) {
                  sprintStory = new SprintStory({
                    story_id: story.get('id'),
                    sprint_id: sprintId
                  });
                  sprint.SprintStories().add(sprintStory);
                  sprintStory.save(false, {
                    success: function(model, response) {
                      assignedStories += 1;
                      if (assignedStories === unassignedStories.length) {
                        new App.Views.Notice({ message: assignedStories + (assignedStories === 1 ? ' story has' : ' stories have') + ' been assigned to sprint ' + sprint.get('iteration') });
                        $(dialog).dialog('close');
                      }
                    },
                    error: function(model, response) {
                      var errorMessage = "something has gone wrong and we were unable to update the story";
                      try {
                        errorMessage = $.parseJSON(response.responseText).message;
                      } catch (e) { if (window.console) { console.log(e); } }
                      new App.Views.Error({ message: 'Oops, ' + errorMessage + '.<br>Please refresh your browser.' });
                      $(dialog).dialog('close');
                    }
                  });
                });
              }
            },

            Cancel: function() {
              $(this).dialog("close");
            }
          }
        });
      }
    },

    moveToAnotherBacklog: function() {
      var view = this,
          stories = this.model.Stories(),
          assignedStories = stories.filter(function(story) { return story.SprintStory(); }),
          dialogButtons,
          newDialogHtml;

      if (assignedStories.length) {
        new App.Views.Warning({ message: 'You cannot move stories that are assigned to sprints.<br>Unassign the ' + assignedStories.length + (assignedStories.length === 1 ? ' story' : 'stories') + ' to proceed.' });
      } else {
        $('#dialog-move-theme').remove(); // ensure old dialog HTML is not still in the DOM
        $('body').append(JST['templates/themes/move-theme-dialog']({ backlogs: false }));
        var dialog = $('#dialog-move-theme');
        dialog.dialog({
          resizable: false,
          height:220,
          width: 400,
          modal: true,
          buttons: {
            'Yes, move this theme': function() {
              var backlogId = $(this).find('#backlog-target').val(),
                  backlogName = $(this).find('#backlog-target option:selected').text(),
                  dialog = this;

              if (!backlogId) {
                $(this).find('div.error-message').html('<p>You must select a target backlog.</p>');
              } else {
                $(this).find('div.error-message').html('');
                $(this).find('.progress-placeholder').html('<p>Please wait while we move the theme...</p>');
                $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Working...');
                $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').hide();
                view.model.MoveToBacklog(backlogId, {
                  success: function(model, response) {
                    $(view.el).remove(); // remove HTML for story
                    App.Controllers.Statistics.updateStatistics(response.score_statistics);
                    $(dialog).dialog("close");
                    new App.Views.Notice({ message: 'Theme has been moved to "' + backlogName + '"'});
                  },
                  error: function(event) {
                    var errorMessage = 'Server error trying to move theme. Please reload this page.';
                    try {
                      errorMessage = $.parseJSON(event.responseText).message;
                      var errorView = new App.Views.Error({ message: errorMessage});
                    } catch (e) {
                      if (window.console) { console.log(e); }
                      new App.Views.Error({ message: errorMessage});
                    }
                    $(dialog).dialog("close"); // hide the dialog
                  }
                });
              }
            },

            Cancel: function() {
              $(this).dialog("close");
            }
          }
        });
        dialogButtons = dialog.parents('.ui-dialog').find('.ui-dialog-buttonset');
        dialogButtons.find('button:nth-child(2) span').text('Loading...');
        dialogButtons.find('button:nth-child(1)').hide();
        $.getJSON(document.location.href.replace(/^(.*\/accounts\/\d+\/backlogs).*$/, "$1/append-targets"))
          .success(function(data) {
            if (data.length <= 1) {
              new App.Views.Warning({ message: 'There are no editable backlogs that you can move this theme to.<br>Create a new target backlog first.' });
              dialog.dialog('close');
            } else {
              data = _(data).reject(function(b) { return b.id === view.model.Backlog().get('id'); });
              newDialogHtml = $(JST['templates/themes/move-theme-dialog']({ backlogs: data }));
              $('#dialog-move-theme').html(newDialogHtml.html());
              dialogButtons.find(':nth-child(2) span').text('Cancel');
              dialogButtons.find(':nth-child(1)').show();
            }
          })
          .error(function() {
            dialog.dialog('close');
            new App.Views.Error({ message: 'Oops, something has gone wrong.<br>We could not retrieve a list of target backlogs.' });
          });
      }
    },

    expandCollapse: function(options) {
      $(this.el).toggleClass('collapsed');
      if (!options || !options.doNotPersistChange) { // doNotPersistChange indicates that this expand/collapse is being called at initialisation time so does not need to be saved to the DB
        if ($(this.el).hasClass('collapsed')) {
          this.model.Backlog().UserSettings().addCollapsedTheme(this.model.get('id'));
        } else {
          this.model.Backlog().UserSettings().removeCollapsedTheme(this.model.get('id'));
        }
      }
      this.updateThemeViewAfterExpandOrCollapse();
    },

    updateThemeViewAfterExpandOrCollapse: function() {
      var nonStoryListItems = this.$('ul.stories>li:not(.story)'),
          storyCount = this.model.Stories().select(function(story) { return story.get('meta_filtered') !== true; }).length,
          isCollapsed = $(this.el).is('.collapsed');

      this.model.Stories().each(function(story) { story.set({ meta_collapsed: isCollapsed }); });
      if (isCollapsed) {
        nonStoryListItems.hide();
        this.$('.theme-stats .container .collapsed-title').html(storyCount === 1 ? '1 story collapsed' : storyCount + ' stories collapsed');
      } else {
        nonStoryListItems.show();
        this.$('.theme-stats .container .collapsed-title').html('');
      }
    }
  })
};