/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, Story:false, multiLineHtmlEncode:false,
  AcceptanceCriterion:false */

App.Views.Stories = {
  Index: Backbone.View.extend({
    tagName: 'ul',
    className: 'stories',
    childId: function(model) { return 'story-' + model.get('id'); },

    events: {
      "click .actions a.new-story": "createNew",
      "keydown .actions a.new-story": "addStoryKeyPress"
    },

    initialize: function() {
      this.collection = this.options.collection;
      _.bindAll(this, 'orderChanged');
    },

    render: function() {
      var view = this;

      this.collection.each(function(model) {
        var storyView = new App.Views.Stories.Show(App.Views.Helpers.addUseOptions({
          model: model,
          id: view.childId(model)
        }, view.options));
        $(view.el).append(storyView.render().el);
      });

      if (this.collection.theme.IsEditable()) {
        if (!this.collection.theme.isNew()) { $(this.el).append(JST['templates/stories/new']()); }
        var orderChangedEvent = this.orderChanged;
        var actionsElem;
        // allow stories to be sorted using JQuery UI
        $(this.el).sortable({
          start: function(event, ui) {
            // hide the new story button when dragging
            actionsElem = view.$('>.actions').clone();
            $('ul.stories>li.actions').remove();
            view.storyDragged = true; // log that a drag has occurred to prevent click event executing on story
            // jQuery UI & vTip conflict, had to manually fire a mouseleave event and remove the vtip class so vtip
            //  won't do anything until dragging is over
            $('#vtip').remove();
            view.$('.move-story.vtipActive').mouseleave();
            view.$('.move-story').removeClass('vtip');
            // because drag does not let events propogage the color picker remains, so manually hide
            $('.color-picker').hide();
            // add a place holder into empty themes
            $('ul.themes li.theme>.stories>ul.stories').each(function(index, stories) {
              if ($(stories).find('li.story').length === 0) {
                $(stories).prepend('<li class="story placeholder"></li>');
              }
            });
          },
          stop: function(event, ui) {
            var themeId, newTheme, storyId, storyLi;
            App.Views.Stories.Index.stopMoveEvent = true; // stop the event firing for the move dialog
            $('ul.themes li.story.placeholder').remove(); // clear placeholders
            if ($(view.el).parents('li.theme')[0] !== $(event.target).parents('li.theme')[0]) {
              // user has dragged story to a new a theme
              themeId = $(event.target).parents('li.theme').attr('id').replace('theme-','');
              storyLi = $(event.target).is('li.story') ? $(event.target) : $(event.target).parents('li.story');
              storyId = storyLi.attr('id').replace('story-','');
              newTheme = view.collection.theme.Backlog().Themes().get(Number(themeId));
              newTheme.AddExistingStory(storyId, {
                success: function() {
                  orderChangedEvent({ reloadStatistics: true });
                  orderChangedEvent({ reloadStatistics: true }, $(event.target).parents('ul.stories').find('>li.story'), newTheme.Stories());
                },
                error: function(event) {
                  var errorView, errorMessage = 'Server error trying to move story to new theme. Please reload this page.';
                  try {
                    errorMessage = $.parseJSON(event.responseText).message;
                    errorView = new App.Views.Error({ message: errorMessage});
                  } catch (e) {
                    if (window.console) { console.log(e); }
                    errorView = new App.Views.Error({ message: errorMessage});
                  }
                }
              });
            } else {
              orderChangedEvent();
            }
            // show the new story button again
            $('ul.stories').each(function(index, stories) {
              $(stories).append(actionsElem.clone());
            });
            // add the tips back in to work around jQuery UI and vTip conflict on Firefox
            view.$('.move-story').addClass('vtip');
          },
          placeholder: 'target-order-highlight',
          axis: 'y',
          items: 'li.story',
          connectWith: 'ul.themes li.theme>.stories>ul.stories'
        }).find('.move-story').disableSelection();

        // not using standard view events as they fire too late, we need this to fire before colorPicker catches the event
        //  so that we can hide the vtip
        this.$('.color-picker-icon a').click(function(event) {
          $('#vtip').remove();
          $(event.target).mouseleave();
        });
      }

      return(this);
    },

    createNew: function(event) {
      event.preventDefault();
      var model = new Story();
      this.collection.add(model);
      this.$('li:last').before(new App.Views.Stories.Show(App.Views.Helpers.addUseOptions({
        model: model
      }, this.options)).render().el);
      var view = this;
      this.$('li.story:last').css('display','none').slideDown('fast', function() {
        view.$('li.story:last > .user-story > .as-a > .data').click(); // browser bug, needs to defer, so used animation
      });
    },

    addStoryKeyPress: function(event) {
      var thisTheme, nextTheme, lastStory;

      if (9 == event.keyCode) { // tab pressed
        event.preventDefault();
        if (event.shiftKey) { // <-- moving back
          event.preventDefault();
          thisTheme = $(this.el).parents('li.theme');
          lastStory = thisTheme.find('li.story:not(.locked,.collapsed):last .score-90 .data, li.story:not(.locked,.collapsed):last .score .data');
          if (lastStory.length) {
            App.Views.Helpers.scrollIntoBacklogView(lastStory, function() {
              lastStory.click();
            });
          } else {
            App.Views.Helpers.scrollIntoBacklogView(thisTheme.find('.theme-data .name .data'), function(elem) {
              elem.click();
            });
          }
        } else { // --> moving forward
          nextTheme = $(this.el).parents('li.theme').next();
          if (nextTheme.hasClass('theme')) {
            // next theme exists, focus on the theme name field
            App.Views.Helpers.scrollIntoBacklogView(nextTheme.find('.theme-data .name .data'), function(elem) {
              elem.click();
            });
          } else {
            // focus on add theme button
            App.Views.Helpers.scrollIntoBacklogView(nextTheme.find('a.new-theme'), function(elem) {
              elem.focus();
            });
          }
        }
      } else if (13 === event.keyCode) { // enter pressed
        event.preventDefault();
        this.createNew(event);
      }
    },

    // method is called after JQuery UI re-ordering
    orderChanged: function(options, storyList, storyCollection) {
      var orderIndexesWithIds = {};
      if (!storyList) { storyList = this.$('li.story'); }
      if (!storyCollection) { storyCollection = this.collection; }
      storyList.each(function(index, elem) {
        var elemId = _.last($(elem).attr('id').split('-'));
        if (!isNaN(parseInt(elemId, 10))) { // unless story is new and not saved yet
          orderIndexesWithIds[elemId] = index + 1;
        }
      });
      if (window.console) { console.log('Order changed and saving - ' + JSON.stringify(orderIndexesWithIds)); }
      storyCollection.saveOrder(orderIndexesWithIds, options);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'story',
    deleteDialogTemplate: 'templates/stories/delete-dialog',

    events: {
      "click .delete-story>a": "remove",
      "click .duplicate-story>a": "duplicate",
      "click .assign-sprint>a": "assignToSprint",
      "click .status .tab": 'statusChangeClick'
    },

    initialize: function() {
      var that = this;

      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'navigateEvent', 'moveToThemeDialog', 'moveToTheme', 'changeColor', 'updateViewWithModelData');

      this.model.bind('change', function(model) {
        // if sprint_story_status_id or sprint_story_id is set by story then we need to update the view
        that.updateViewWithModelData(model.changedAttributes());
      });
    },

    render: function() {
      this.updateViewWithModelData('all');

      this.configureView();

      return this;
    },

    configureView: function() {
      var view = new App.Views.AcceptanceCriteria.Index({ collection: this.model.AcceptanceCriteria() }),
        show_view = this,
        tabElems = ['.user-story .data', '.unique-id .data', '.comments .data', '.score-50 .data', '.score-90 .data', '.score .data'];

      this.$('.acceptance-criteria').html(view.render().el);

      if (this.model.IsEditable()) {
        this.makeFieldsEditable();

        this.$('.move-story a').mousedown(function(event) {
          App.Views.Stories.Index.stopMoveEvent = false; // unless changed to true when dragged, don't stop this move event
        }).click(function(event) {
          event.preventDefault();
          if (!App.Views.Stories.Index.stopMoveEvent) {
            show_view.moveToThemeDialog();
          }
        });

        this.$('.color-picker-icon a').simpleColorPicker({
          onChangeColor: function(col) { show_view.changeColor(col); },
          colorsPerLine: 4,
          colors: ['#ffffff', '#dddddd', '#bbbbbb', '#999999',
                   '#ff0000', '#ff9900', '#ffff00', '#00ff00',
                   '#00ffff', '#6666ff', '#9900ff', '#ff00ff',
                   '#f4cccc', '#d9ead3', '#cfe2f3', '#ead1dc',
                   '#ffe599', '#b6d7a8', '#b4a7d6', '#d5a6bd',
                   '#e06666', '#f6b26b', '#ffd966', '#93c47d']
        });

        App.Views.Helpers.enableActionMenu(this, '.story-actions');
      } else {
        // only show warnings about user's ability to edit if the backlog itself is not locked anyway such as an archive or snapshot
        if (!this.model.IsLocked()) {
          // make all editable fields show warning that item is not editable
          _.each(tabElems, function(elem) {
            show_view.$(elem).click(function() {
              var message = show_view.model.CanEdit() ? 'You cannot edit a story that is marked as accepted' : 'You do not have permission to edit stories for this backlog';
              new App.Views.Warning({ message: message });
            });
          });
        }
      }

      if (this.model.get('color')) { this.changeColor(this.model.get('color'), { silent: true }); }

      // activate roll over links for comments and acceptance criteria
      App.Views.Helpers.activateUrlify(this.el);

      this.setStatusHover();
    },

    // called whenever a change is made to the model
    updateViewWithModelData: function(attributes) {
      var that = this;

      if (attributes === 'all') {
        // just populate the entire element as we're initializing
        $(this.el).html( JST['templates/stories/show'](App.Views.Helpers.addUseOptions({ model: this.model }, this.options)) );
      } else if (attributes && (attributes.sprint_story_status_id || attributes.sprint_story_id)) {
        // sprint story status has changed, lets update the entire HTML as it may or may not be locked now
        $(this.el).html( JST['templates/stories/show'](App.Views.Helpers.addUseOptions({ model: this.model }, this.options)) );
        this.configureView();
      }

      // set class so that other elements (mainly for tab order) know if this class is locked or not
      if (this.model.IsEditable()) {
        $(this.el).removeClass('locked');
      } else {
        $(this.el).addClass('locked');
      }
    },

    setStatusHover: function() {
      App.Views.Helpers.setStatusHover.apply(this, arguments);
    },

    statusChangeClick: function(event) {
      App.Views.Helpers.statusChangeClick.apply(this, arguments);
    },

    makeFieldsEditable: function() {
      var show_view = this,
          contentUpdatedFunc = function(value) { return show_view.contentUpdated(value, this); },
          beforeChangeFunc = function(value) { return show_view.beforeChange(value, this); },
          defaultOptions = _.extend(_.clone(this.defaultEditableOptions), {
            data: beforeChangeFunc,
            onKeyDown: show_view.navigateEvent // make all input and textarea fields respond to Tab/Enter
          }),

      // for unique ID, we need to remove the code before editing and insert back in after editing
          uniqueIdContentUpdatedFunc = function(value) {
            return show_view.model.Theme().get('code') + contentUpdatedFunc.call(this, value);
          },
        uniqueIdBeforeChangeFunc = function(value) {
            return beforeChangeFunc.call(this, value.substring(3));
          },
        scoreContentUpdatedFunc = function(value) {
            return contentUpdatedFunc.call(this, niceNum(value));
          },
        commentsContentUpdatedFunc = function(value) {
          var that = this;
          setTimeout(function() {
            $(that).html(urlify($(that).html(), 35));
          }, 100);
          return contentUpdatedFunc.call(this, value);
        },
        commentsBeforeChangeFunc = function(value) {
          var html;
          unUrlify(this);
          html = htmlDecodeWithLineBreaks($(this).html());
          return beforeChangeFunc.call(this, html);
        },
        uniqueIdOptions = _.extend(_.clone(defaultOptions), { data: uniqueIdBeforeChangeFunc, maxLength: 4 }),
        validScores = this.model.Theme().Backlog().get('valid_scores');

      this.$('>div.unique-id .data').editable(uniqueIdContentUpdatedFunc, uniqueIdOptions);

      this.$('>div.score-50 .data, >div.score-90 .data, >div.score .data').editable(scoreContentUpdatedFunc, _.extend(_.clone(defaultOptions), {
        maxLength: 4,
        autoComplete: validScores ? _(validScores).map(function(score) { return String(score); }) : null
      }) );

      this.$('>div.comments .data').editable(commentsContentUpdatedFunc, _.extend(_.clone(defaultOptions), {
        type: 'textarea', saveonenterkeypress: true, autoResize: true, data: commentsBeforeChangeFunc, noChange: commentsContentUpdatedFunc
      } ) );

      // callback to get a list of all as_a values for autocomplete
      var autoCompleteData = function() {
        var asAValues = [];
        show_view.model.Theme().collection.each(function(theme) {
          asAValues = asAValues.concat(theme.Stories().pluck('as_a'));
        });
        return _.uniq(_.compact(asAValues)).sort();
      };

      // make the user story fields less wide so they fit with the heading
      _.each(['as-a','i-want-to','so-i-can'], function(elem) {
        _.defer(function() { // wait until elements have rendered
          var width = show_view.$('>div.user-story .' + elem + ' .heading').outerWidth() + 10;
          var options = _.extend(_.clone(defaultOptions), {
            type: (elem === 'as-a' ? 'text' : 'textarea'),
            maxLength: (elem == 'as-a' ? 100 : 2040),
            saveonenterkeypress: true,
            lesswidth: width,
            autoResize: true,
            autoComplete: (elem === 'as-a' ? autoCompleteData : null)
          });
          show_view.$('>div.user-story .' + elem + ' .data').editable(contentUpdatedFunc, options);
        });
      });
    },

    // Tab or Enter key pressed so let's move on
    navigateEvent: function(event) {
      var isInput = $(event.target).is('input'), // ctrl-enter in a textarea creates new line, in input simply move on and assume enter was meant
          viewElements, dataClass, dataElem, sibling, previousSelector, lastCriterion, previousUnlocked;

      if (_.include([9,13,27], event.keyCode) && (isInput || (!event.ctrlKey && !event.altKey)) ) { // tab, enter, esc
        $(event.target).blur();
        try { // cannot preventDefault if esc as esc event is triggered manually from jeditable
          event.preventDefault();
        } catch (e) { }

        // set up array of all elements in this view in the tab order
        viewElements = [
          'unique-id .data',
          'as-a .data',
          'i-want-to .data',
          'so-i-can .data',
          'acceptance-criteria ul.acceptance-criteria li:first-child>*',
          'comments .data'
        ];
        if (this.options.use5090Estimates) {
          viewElements.push('score-50 .data');
          viewElements.push('score-90 .data');
        } else {
          viewElements.push('score .data');
        }

        dataClass = $(event.target);
        if (!dataClass.hasClass('data')) { dataClass = dataClass.parents('.data:first'); } // if event has come from esc, we're already on .data
        dataClass = dataClass.parent(); // get to the parent to get the class name which indicates the field name
        dataElem = _.detect(viewElements, function(id) { return dataClass.hasClass(_.first(id.split(' '))); });

        if (dataElem) { // user has tabbed from a data element
          if (!event.shiftKey) { // moving -->
            if (dataElem != _.last(viewElements)) {
              // move to next element
              this.$('.' + viewElements[_.indexOf(viewElements, dataElem) + 1]).click();
            } else {
              // move onto next view as we're at the last element
              sibling = $(this.el).nextAll('li:not(.locked,.collapsed):first');
              if (sibling.find('a.new-story').length) {
                // just a new story button
                App.Views.Helpers.scrollIntoBacklogView(sibling.find('a.new-story'), function(elem) {
                  elem.focus();
                });
              } else {
                App.Views.Helpers.scrollIntoBacklogView(sibling.find('.' + _.first(viewElements)), function(elem) {
                  elem.click();
                });
              }
            }
          } else { // moving <--
            if (dataElem != _.first(viewElements)) {
              // move to previous element
              previousSelector = viewElements[_.indexOf(viewElements, dataElem) - 1];
              if (previousSelector.indexOf('acceptance-criteria') === 0) {
                // exception, we need to move to acceptance criteria
                lastCriterion = this.$('.acceptance-criteria ul.acceptance-criteria li:visible:last>*');
                App.Views.Helpers.scrollIntoBacklogView(lastCriterion, function(elem) {
                  elem.click();
                });
              } else {
                this.$('.' + previousSelector).click();
              }
            } else {
              // user is at first field in story, so jump back to theme or previous story
              previousUnlocked = $(this.el).prevAll('li:not(.locked,.collapsed):first');
              if (previousUnlocked.length) {
                // jump to end of previous story
                App.Views.Helpers.scrollIntoBacklogView(previousUnlocked.find('.score-90 .data, .score .data'), function(elem) {
                  elem.click();
                });
              } else {
                // no previous stories so jump to theme
                App.Views.Helpers.scrollIntoBacklogView($(this.el).parents('li.theme').find('.theme-data >.name .data'), function(elem) {
                  elem.click();
                });
              }
            }
          }
        }
      } else if ( (event.keyCode === 13) && (event.ctrlKey || event.altKey) ) {
        event.preventDefault();
        event.stopPropagation();
        $(event.target).insertAtCaret('\n');
      }
    },

    changeEvent: function(eventName, model) {
      var newValue;

      // only update specific field changes and ignore acceptance criteria as changes are made in that view and model
      if ( (eventName.substring(0,7) === 'change:') && (eventName !== 'change:acceptance_criteria') ) {
        var fieldChanged = eventName.substring(7);
        newValue = this.model.get(fieldChanged);
        if (fieldChanged === 'unique_id') {
          // check if field is being edited as we tab straight from code to unique_id
          if (this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data input').length === 0)
          {
            // unique_id is not being edited so updated with new value
            newValue = this.model.Theme().get('code') + newValue;
            this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(newValue);
          } else {
            // unique_id is being edited, so just update the ID as no code is shown when editing unique_id
            this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data input').val(newValue);
          }
        } else if (_.isString(newValue)) {
          if (fieldChanged.match(/^score/)) {
            newValue = niceNum(newValue);
          } else {
            newValue = multiLineHtmlEncode(newValue);
          }
          if (newValue === '') { newValue = this.defaultEditableOptions.placeholder; } // if empty, put editable placeholder back in field
          this.$('div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').html(newValue);
        }
        if (eventName == 'change:id') {
          $(this.el).attr('id', 'story-' + model.get('id'));
        }
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
      }
    },

    deleteAction: function(dialog_obj, view) {
      var model_collection = view.model.collection;

      // tell the user we're deleting as it may take a second
      $(dialog_obj).find('>p').html('Deleting story...<br /><br />Please wait.');
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

    // user has clicked move so ask them where we are moving to
    moveToThemeDialog: function() {
      if (window.console) { console.log('Requested to move'); }
      var view = this;
      $('#dialog-move-story').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/stories/move-dialog']({ story: this.model, themes: this.model.Theme().Backlog().Themes() }));
      $('#dialog-move-story').dialog({
        resizable: false,
        height:170,
        modal: true,
        buttons: {
          Move: function() {
            view.moveToTheme(this);
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    },

    // user has responded to
    moveToTheme: function(dialog) {
      var themeId = $(dialog).find('select#theme-target option:selected').attr('id');
      if (themeId != this.model.Theme().get('id')) {
        if (window.console) { console.log('Moving to theme-' + themeId); }
        $(this.el).insertBefore($('li.theme#theme-' + themeId + ' ul.stories>li:last'));
        this.model.MoveToTheme(themeId, {
          success: function(model, response) {
            var errorView = new App.Views.Notice({ message: 'The story was moved successfully.'});
          },
          error: function() {
            var errorView = new App.Views.Error({ message: 'The story move failed.  Please refresh your browser.'});
          }
        });
      }
      $(dialog).dialog("close");
    },

    // change background color
    // pass in { silent: true } as an option to not update the database
    changeColor: function(color, options) {
      var colorWithoutHex = App.Views.Helpers.setStoryColor(this.el, color);
      if (!options || !options.silent) {
        this.model.set({ color: colorWithoutHex });
        this.model.save();
      }
    },

    // duplicate story event fired
    duplicate: function(event) {
      var model = new Story(),
          attributes = _.clone(this.model.attributes);
      event.preventDefault();
      delete attributes.id;
      delete attributes.unique_id;
      // get the criteria and add to the new model
      this.model.AcceptanceCriteria().each(function(criterion) {
        var crit = new AcceptanceCriterion();
        crit.set({ criterion: criterion.get('criterion') });
        model.AcceptanceCriteria().add(crit);
      });
      model.set(attributes);
      this.model.collection.add(model);
      var storyView = new App.Views.Stories.Show(App.Views.Helpers.addUseOptions({ model: model, id: 0 }, this.options)); // set id 0 as will change when model is saved
      var newStoryDomElem = $(storyView.render().el);
      newStoryDomElem.insertBefore($(this.el).parents('ul.stories').find('>li.actions'));
      model.save(false, {
        success: function(model, response) {
          model.AcceptanceCriteria().each(function(criterion) {
            criterion.save(); // we need to save the models as they were added when story had no ID and were thus never saved
          });
        },
        error: function(model, error) {
          if (window.console) { console.log(JSON.stringify(error)); }
          var errorView = new App.Views.Error({ message: 'The story could not be copied.  Please refresh your browser.'});
        }
      });
      _.delay(function() {
        newStoryDomElem.find('.user-story .as-a>.data').click(); // focus on as_a after enough time for DOM to update
      }, 400);
    },

    assignToSprint: function(event) {
      var view = this,
          sprints = this.model.Theme().Backlog().Sprints(),
          incompleteSprints = sprints.reject(function(sprint) { return sprint.IsComplete(); });


      if (sprints.length === 0) {
        new App.Views.Warning({ message: 'You have not created any sprints yet.<br>Click on the Sprints tab to add a sprint first.'});
      } else if (incompleteSprints.length === 0) {
        new App.Views.Warning({ message: 'All sprints are marked as complete.<br>You need to add a new sprint before you can assign this story.'});
      } else {
        $('#dialog-assign-sprint').remove(); // ensure old dialog HTML is not still in the DOM
        $('body').append(JST['templates/stories/assign-sprint-dialog']({ story: this.model, sprints: _(incompleteSprints).sortBy(function(sprint) { return sprint.get('iteration'); }).reverse() }));
        $('#dialog-assign-sprint').dialog({
          resizable: false,
          height:170,
          modal: true,
          buttons: {
            Assign: function() {
              var sprintId = $(this).find('#sprint-target').val(),
                  dialog = this,
                  sprint,
                  reassigned = false,
                  sprintStories,
                  sprintStory;

              if (!sprintId) {
                $(this).find('div.error-message').html('<p>You must select a sprint first.</p>');
              } else {
                $(this).find('div.error-message').html('');
                $(this).find('.progress-placeholder').html('<p>Please wait while we update this story...</p>');
                $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
                $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').hide();

                if (sprintId === 'none') {
                  sprintStories = view.model.SprintStory().Sprint().SprintStories();
                  view.model.SprintStory().destroy({
                    success: function(model, response) {
                      sprintStories.remove(sprintStory);
                      $(dialog).dialog('close');
                    },
                    error: function(model, response) {
                      var errorMessage = 'Oops, we\'ve been unable to unassign that story from the sprint.<br>Please refresh your browser.';
                      try {
                        errorMessage = $.parseJSON(response.responseText).message;
                      } catch (e) { if (window.console) { console.log(e); } }
                      var errorView = new App.Views.Error({ message: errorMessage});
                      $(dialog).dialog('close');
                    }
                  });
                } else {
                  sprint = view.model.Theme().Backlog().Sprints().get(Number(sprintId));
                  if (view.model.SprintStory()) {
                    sprintStory = view.model.SprintStory();
                    sprintStory.set({ move_to_sprint_id: sprintId });
                    reassigned = true;
                  } else {
                    sprintStory = new SprintStory({
                      story_id: view.model.get('id'),
                      sprint_id: sprintId
                    });
                    sprint.SprintStories().add(sprintStory);
                  }
                  sprintStory.save(false, {
                    success: function(model, response) {
                      if (reassigned) {
                        view.model.SprintStory().Sprint().SprintStories().remove(sprintStory);
                        sprint.SprintStories().add(sprintStory);
                      }
                      $(dialog).dialog('close');
                    },
                    error: function(model, response) {
                      if (!reassigned) {
                        sprint.SprintStories().remove(sprintStory);
                      }
                      var errorMessage = "something has gone wrong and we were unable to update the story";
                      try {
                        errorMessage = $.parseJSON(response.responseText).message;
                      } catch (e) { if (window.console) { console.log(e); } }
                      var errorView = new App.Views.Error({ message: 'Oops, ' + errorMessage + '.<br>Please refresh your browser.' });
                      $(dialog).dialog('close');
                    }
                  });
                }
              }
            },

            Cancel: function() {
              $(this).dialog("close");
            }
          }
        });
      }
    }
  })
};