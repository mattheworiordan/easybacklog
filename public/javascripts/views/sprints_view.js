/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.Sprints = {
  Show: App.Views.BaseView.extend({
    childId: function(model) { return 'sprint-story-' + model.get('id'); },
    persistOrderActions: 0, // stop duplicate order actions from running, so keep track of queue and only execute when queue is empty

    events: {
      "click .stories-divider .change-size": "toggleUnassignedStoriesSize",
      "click a.mark-sprint-as-incomplete": "markSprintAsIncomplete",
      "click a.mark-sprint-as-complete": "markSprintAsComplete",
      "click a.bulk-move-stories": "bulkMoveStories"
    },

    initialize: function(options) {
      App.Views.BaseView.prototype.initialize.call(this);
      this.sprintTabsView = options.sprintTabsView;
      _.bindAll(this, 'persistSprintStories', 'positionStoriesContainerOnScroll', 'updateStatistics');
    },

    render: function() {
      var that = this,
          storiesAssignedToSprints = {},
          sortFn;

      // load sprints view
      $(this.el).html(JST['sprints/show']({ model: this.model }));

      // if contracted, then update the sizes of the divs
      that.toggleUnassignedStoriesSize(true);

      this.updateStatistics(this.model.attributes);
      this.model.fetch({ success: function(model) { that.updateStatistics(model.attributes); } });

      // show stories assigned to sprint
      sortFn = function(t) { return t.get('position'); };
      _(this.model.SprintStories().sortBy(sortFn)).each(function(model) {
        var view = new App.Views.Sprints.SprintStory({ model: model.Story(), parentView: that, id: that.childId(model.Story()) });
        $(that.el).find('.stories-container .cards').append(view.render().el);
      });

      // get a list of all stories assigned to all sprints
      this.model.collection.each(function(sprint) {
        sprint.SprintStories().each(function(sprintStory) {
          storiesAssignedToSprints[sprintStory.get('story_id')] = sprintStory;
        });
      });

      // now show all stories not yet assigned to a sprint
      _(this.model.Backlog().Themes().sortBy(sortFn)).each(function(theme) {
        _(theme.Stories().sortBy(sortFn)).each(function(story) {
          if (!storiesAssignedToSprints[story.get('id')]) {
            var view = new App.Views.Sprints.SprintStory({ model: story, parentView: that, id: that.childId(story) });
            $(that.el).find('.unassigned-stories-container').append(view.render().el);
          }
        });
      });

      // if sprint is complete, all unassigned stories are locked
      if (this.model.isComplete()) {
        this.$('.unassigned-stories-container .story-card').addClass('locked');
      }

      // allow drag & drop of stories
      this.$('.stories-container .cards, .unassigned-stories-container').sortable({
        connectWith: ".story-droppable",
        stop: that.persistSprintStories,
        placeholder: 'story-card-place-holder',
        cancel: '.locked' // do not allow drag & drop of locked stories
      }).disableSelection();

      // ensure stories container is never completely off the screen when scrolling down
      $(window).bind('scroll.sprints', this.positionStoriesContainerOnScroll).bind('resize.sprints', this.positionStoriesContainerOnScroll);

      // set up a mouse tracker if one does not exist already so we can track where the mouse is
      // and when we move an element under the cursor, we can trigger hover
      // this happens when a story is moved assigned, and a new story falls under the mouse but the move button does not appear
      // as there is no hover event without a mouse move
      if (!App.Views.MouseTracker) {
        App.Views.MouseTracker = new MouseTracker(jQuery);
      }

      return this;
    },

    updateStatistics: function(attributes) {
      this.model.set(attributes);
      $('#backlog-data-area .backlog-stats').html( JST['sprints/stats']({ attributes: attributes }) );

      var totals = this.$('.stories-container .totals');
      if (this.model.SprintStories().length === 0) {
        totals.addClass('notice').html( JST['sprints/empty']() );
      } else {
        totals.removeClass('notice').html( JST['sprints/totals']({ attributes: attributes, storyCount: this.model.SprintStories().length, sprint: this.model }) );
      }
      this.sprintTabsView.adjustTabConstraints(true);
      this.updateSprintButtonsView();
    },

    // allow unassigned stories area to be minimised / expanded
    toggleUnassignedStoriesSize: function(dontToggle) {
      var storyContainerSizes = [70, 48.5], // 1st is main story container contracted size, 2nd is expanded size
          spaceBetween = 3,
          dividerOffset = 1,
          headingOffset = 1.5,
          that = this;

      if (dontToggle !== true) {
        $(this.el).toggleClass('contracted-unassigned-stories');
      }

      if ($(this.el).hasClass('contracted-unassigned-stories')) {
        newStoryContainerSize = storyContainerSizes[0];
      } else {
        newStoryContainerSize = storyContainerSizes[1];
      }

      if (dontToggle !== true) {
        this.$('.stories-divider .handle').hide();
        this.$('.stories-container').animate({ width: newStoryContainerSize + '%' }, 'fast');
        this.$('.unassigned-stories-container').animate({
          width: (100 - newStoryContainerSize - spaceBetween) + '%',
          'margin-left': (newStoryContainerSize + spaceBetween) + '%'
        }, 'fast');
        this.$('.stories-divider').animate({ left: (newStoryContainerSize + dividerOffset) + '%' }, 'fast');
        this.$('.unassigned-stories-heading').animate({
          left: (newStoryContainerSize + headingOffset) + '%',
          width: (100 - 0.5 - (newStoryContainerSize + headingOffset)) + '%'
        }, 'fast', null, function() {
          var direction = ($(that.el).hasClass('contracted-unassigned-stories')) ? 'right' : 'left';
          that.$('.stories-divider .handle').show('slide', { direction: direction }, 'fast');
          that.$('.story-card').each(function(index, elem) {
            $(elem).data('reset-toggle')();
          });
        });
      } else {
        // use has not toggled, so just resize immediately
        this.$('.stories-container').css('width', newStoryContainerSize + '%');
        this.$('.unassigned-stories-container').
          css('width', (100 - newStoryContainerSize - spaceBetween) + '%').
          css('margin-left', (newStoryContainerSize + spaceBetween) + '%');
        this.$('.stories-divider').css('left', (newStoryContainerSize + dividerOffset) + '%');
        this.$('.unassigned-stories-heading').css('left', (newStoryContainerSize + headingOffset) + '%').css('width', (100 - 0.5 - (newStoryContainerSize + headingOffset)) + '%')

        this.$('.story-card').each(function(index, elem) {
          $(elem).data('reset-toggle')();
        });
      }
    },

    // stories stories that are removed / added to the database
    // called every time a story shifts in the lists
    persistSprintStories: function() {
      var that = this,
          persistOrder;

      // keep a counter of how many persist actions need to complete before we can set the ordering
      persistOrder = function() {
        that.persistOrderActions -= 1;
        if (that.persistOrderActions <= 0) {
          that.persistOrderActions = 0;
          var updateParams = {};
          that.$('.stories-container .story-card').each(function(index, storyNode) {
            var storyId = Number($(storyNode).attr('id').replace('sprint-story-',''));
            var sprintStory = that.model.SprintStories().getByStoryId(storyId);
            if (sprintStory.get('position') !== index+1) {
              updateParams[sprintStory.get('id')] = index+1;
            }
          });
          if (Object.keys(updateParams).length) {
            that.model.SprintStories().batchUpdatePosition(updateParams, {
              error: function() {
                var errorView = new App.Views.Error({ message: 'Order of stories could not be saved.  Please refresh your browser' });
              }
            })
          }
        }
      }

      // Remove SprintStory models from Sprint that are no longer in the list
      this.model.SprintStories().each(function(story) {
        if (!that.$('.stories-container #' + that.childId(story.Story())).length) {
          var storyNode = $('.unassigned-stories-container #' + that.childId(story.Story()));
          storyNode.data('reset-toggle')(); // show the more/less as necessary, contract after drag
          // prevent duplicate destroys being sent if a user removes a lot of items quickly and the server has not responded and updated the models yet
          if (!story.beingDestroyed) {
            that.persistOrderActions += 1;
            story.beingDestroyed = true;
            story.destroy({
              success: function(model, response) {
                story.beingDestroyed = false;
                that.updateStatistics(response.sprint_statistics);
                that.model.set(response.sprint_statistics); // update Sprint with new statistics
                persistOrder();
                storyNode.data('update-sprint-story-status')();
              },
              error: function(model, response) {
                story.beingDestroyed = false;
                var errorMessage = 'Oops, we\'ve been unable to remove that story from this sprint.  Please refresh your browser.';
                try {
                  errorMessage = $.parseJSON(response.responseText).message;
                } catch (e) { if (window.console) { console.log(e); } }
                var errorView = new App.Views.Error({ message: errorMessage});
              }
            });
          }
        }
      });

      this.$('.stories-container .story-card').each(function(index, storyNode) {
        var storyId = Number($(storyNode).attr('id').replace('sprint-story-',''));
        if (!that.model.SprintStories().getByStoryId(storyId)) {
          $(storyNode).data('reset-toggle')(); // show the more/less as necessary, contract after drag
          // we need to persist this sprint story as it's not in the SprintStories collection
          var newSprintStory = new SprintStory({
            story_id: $(storyNode).data('story_id'),
            sprint_id: that.model.get('id')
          });
          that.model.SprintStories().add(newSprintStory);
          that.persistOrderActions += 1;
          newSprintStory.save(false, {
            success: function(model, response) {
              that.updateStatistics(model.get('sprint_statistics'));
              that.model.set(model.get('sprint_statistics')); // update Sprint with new statistics
              persistOrder();
              $(storyNode).data('update-sprint-story-status')();
            },
            error: function(model, response) {
              var errorMessage = 'we\'ve got a problem on our side';
              try {
                errorMessage = $.parseJSON(response.responseText).message;
              } catch (e) { if (window.console) { console.log(e); } }
              var errorView = new App.Views.Error({ message: 'Oops, ' + errorMessage + '.  Please refresh your browser' });
            }
          });
        }
      });

      if (that.persistOrderActions === 0) {
        // looks like no stories have been added or removed, but order may have changed, trigger a check and update if necessary
        persistOrder();
      }

      // now ensure stories container is still at correct height as it could shift up or down whilst scrolled down
      this.positionStoriesContainerOnScroll();

      // now check if a new story has fallen under the mouse i.e. it has shifted up / down under the mouse
      $('.story-card').each(function(index, story) {
        if (App.Views.MouseTracker.isOver(story)) {
          $(story).trigger('mouseenter');
        }
      });
    },

    // stop this sprint's stories from disappearing off the screen as user scrolls down a long list of stories
    positionStoriesContainerOnScroll: function() {
      var storyContainer = this.$('.stories-container'),
          unassignedContainer = this.$('.unassigned-stories-container'),
          storiesDivider = this.$('.stories-divider'),
          height = storyContainer.outerHeight(),
          windowHeight = $(window).height(),
          scrollAmount = $(window).scrollTop(),
          // max scroll is at least until story container has moved up to tabs, and at most when half the stories remain on the page
          maxScroll = Math.max(height - (windowHeight/2) + $('.main-content-pod').offset().top, $('.main-content-pod').offset().top);

      // cache the top as this shouldn't change but does when position is adjusted
      if (!this.storiesContainerTop) {
        this.storiesContainerTop = storyContainer.offset().top;
      }

      // story width needs to be calculated dynamically as unassigned stories panel changes in size when expanded / contracted, or on browser resize
      var storiesWidth = unassignedContainer.offset().left - storiesDivider.width() - storyContainer.offset().left +
        (storiesDivider.offset().left + storiesDivider.width() - unassignedContainer.offset().left) * 2;

      // ensure at least half of the stories container is visible on the page based on it's starting position
      if ( (scrollAmount > maxScroll) && (storyContainer.height() < unassignedContainer.height()) ) {
        if (storyContainer.css('position') !== 'fixed') {
          storyContainer.css('position', 'fixed').css('top', Math.floor(this.storiesContainerTop - maxScroll) + 'px').css('width', storiesWidth + 'px');
        }
        if (storyContainer.css('top') !== Math.floor(this.storiesContainerTop - maxScroll) + 'px') {
          storyContainer.animate({
            top: Math.floor(this.storiesContainerTop - maxScroll) + 'px'
          }, 'fast');
        }
      } else {
        if (storyContainer.css('position') !== 'static') {
          storyContainer.css('position', 'static').css('top', 'auto');
        }
      }

      // unfortunately we've had to fix the width when jumping to fixed, so we need to keep checking width is accurate
      if (storyContainer.css('width') !== storiesWidth + 'px') {
        storyContainer.css('width', storiesWidth + 'px');
      }
    },

    cleanUp: function() {
      $(window).unbind('.sprints');
    },

    markSprintAsComplete: function(event) {
      var that = this;
      event.preventDefault();

      var incompleteStories = this.model.SprintStories().reject(function(story) { return story.Status().isDone(); }),
          previousIncompleteSprints = _(this.model.Backlog().Sprints().select(function(sprint) {
            return (sprint.get('iteration') < that.model.get('iteration')) && !sprint.isComplete();
          })).sortBy(function(sprint) { return sprint.get('iteration'); });

      if (incompleteStories.length) {
        new App.Views.Warning({ message: 'All stories must be marked as Done before marking this sprint as complete' });
      } else if (previousIncompleteSprints.length) {
        new App.Views.Warning({ message: 'Sprint ' + _(previousIncompleteSprints).last().get('iteration') + ' is not complete. Please mark as complete first' });
      } else {
        this.model.set({ 'completed': 'true' });
        this.updatedSprintCompletedStatus();
      }
    },

    markSprintAsIncomplete: function(event) {
      var that = this;
      event.preventDefault();

      var successiveCompleteSprints = _(this.model.Backlog().Sprints().select(function(sprint) {
            return (sprint.get('iteration') > that.model.get('iteration')) && sprint.isComplete();
          })).sortBy(function(sprint) { return sprint.get('iteration'); });

      if (successiveCompleteSprints.length) {
        new App.Views.Warning({ message: 'Sprint ' + _(successiveCompleteSprints).first().get('iteration') + ' is complete. Please mark as incomplete first' });
      } else {
        this.model.set({ 'completed': 'false' });
        this.updatedSprintCompletedStatus();
      }
    },

    updatedSprintCompletedStatus: function() {
      var that = this;

      this.model.save(false, {
        success: function(model, response) {
          that.updateSprintButtonsView();
          new App.Views.Notice({ message: 'Sprint status updated'});
        },
        error: function(model, response) {
          var errorMessage = 'Oops, we\'ve been unable to update the sprint, please try again';
          try {
            errorMessage = $.parseJSON(response.responseText).message;
          } catch (e) { if (window.console) { console.log(e); } }
          var errorView = new App.Views.Error({ message: errorMessage});
        }
      });
    },

    updateSprintButtonsView: function() {
      var that = this;
      var completeView = $('<div>' + JST['sprints/show']({ model: that.model }) + '</div>');
      that.$('h2').replaceWith(completeView.find('h2'));
      that.$('.complete-status').replaceWith(completeView.find('.complete-status'));
      // show notice about stories being locked if appropriate, and lock stories
      that.$('.unassigned-stories-container .notice').remove();
      if (that.model.isComplete()) {
        that.$('.unassigned-stories-container').prepend(completeView.find('.unassigned-stories-container .notice'));
        that.$('.unassigned-stories-container .story-card').addClass('locked');
      } else {
        that.$('.unassigned-stories-container .story-card').removeClass('locked');
      }
    },

    bulkMoveStories: function(event) {
      var that = this,
          eligibleSprints = this.model.Backlog().Sprints().filter(function(sprint) { return sprint.get('iteration') > that.model.get('iteration'); });

      event.preventDefault();
      $('#dialog-move-sprint-stories').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['sprints/move-dialog']({ sprints: eligibleSprints }));
      $('#dialog-move-sprint-stories').dialog({
        resizable: false,
        height:200,
        width: 280,
        modal: true,
        buttons: {
          'Move': function() {
            // create snapshot on server by posting a request
            var target = $(this).find('select').val(),
                sprintStories = that.model.SprintStories().incompleteStories();
            if (target === '') {
              $(this).find('div.error-message').html('<p>You must select a destination first.</p>');
            } else {
              $(this).find('.progress-placeholder').html('<p>Please wait while we move the incomplete stories...</p>');
              $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
              $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').hide();
              _(sprintStories).each(function(sprintStory) {
                var story = sprintStory.Story(),
                    storyNode = that.$('#' + that.childId(story));
                if (target === 'backlog') {
                  storyNode.data('move-story')();
                } else {
                  storyNode.slideUp();
                  // set attribute move_to_sprint_id as sprint_id param is set as part of the URL in Rails so cannot be overwritten
                  sprintStory.save({ 'move_to_sprint_id': target }, {
                    success: function(model, response) {
                      that.model.SprintStories().remove(model);
                      that.model.collection.get(target).SprintStories().add(model);
                    },
                    error: function(model, response) {
                      var errorMessage = 'There was an error moving the stories...  Please refresh your browser.';
                      try {
                        errorMessage = $.parseJSON(response.responseText).message;
                      } catch (e) { if (window.console) { console.log(e); } }
                      var errorView = new App.Views.Error({ message: errorMessage});
                    }
                  });
                }
              });
              $(this).dialog("close");
            }
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    }
  }),

  Help: App.Views.BaseView.extend({
    pod: false,

    initialize: function(options) {
      App.Views.BaseView.prototype.initialize.call(this);
      this.sprintTabsView = options.sprintTabsView;
      _.bindAll(this, 'addSprint');
    },

    render: function() {
      $(this.el).html(JST['sprints/help']());
      this.pod = $(JST['sprints/help-pod']());
      this.pod.find('a.add-new-sprint').click(this.addSprint);
      this.$('a.add-new-sprint').click(this.addSprint);
      $('section.main-content-pod').before(this.pod);
    },

    addSprint: function(event) {
      this.sprintTabsView.createNew(event);
    },

    cleanUp: function() {
      this.pod.remove();
    }
  }),

  // Note this view gets passed a Story model as story cards can appear unassigned and thus don't have a SprintStory
  SprintStory: App.Views.BaseView.extend({
    tagName: 'div',
    className: 'story-card',
    contractedHeight: 90,
    heightBuffer: 10,

    events: {
      "click .more .tab": "toggleMore",
      "click .move": 'moveStory',
      "click .status .tab": 'statusChangeClick'
    },

    initialize: function(options) {
      App.Views.BaseView.prototype.initialize.call(this);
      this.parentView = options.parentView;
      _.bindAll(this, 'resetToggle', 'updateSprintStoryStatus');
    },

    render: function() {
      var that = this;
      $(this.el).html(JST['sprints/sprint-story']({ model: this.model }));
      this.setStatusHover();

      // set heights of story cards to no greater than contractedHeight, must do after this element has actually rendered in the page
      setTimeout(function() {
        that.resetToggle();
      }, 1);
      $(this.el).data('reset-toggle', this.resetToggle);

      // allow move to be called for the move all incomplete stories dialog box
      $(this.el).data('move-story', function() { that.moveStory(); });

      // resolve hover issue with IE, see http://stackoverflow.com/questions/7891761/
      $(this.el).hover(function() {
        $(this).addClass('hover');
      }, function() {
        $(this).removeClass('hover');
      });

      // store data so we can identify this DOM element
      $(this.el).data('story_id', this.model.get('id'));

      // add reference to method to update sprintStoryStatus as this will change when moved
      $(this.el).data('update-sprint-story-status', this.updateSprintStoryStatus);

      // if not editable, set the class so it cannot be moved
      this.setEditableState();

      return this;
    },

    // set the heights of the story card so that it's no more than this.contractedHeight
    // if it is, then set to this.contractedHeight and show the more button
    resetToggle: function() {
      $(this.el).css('height', 'auto');
      if ($(this.el).height() > this.contractedHeight + this.heightBuffer) {
        $(this.el).data('original-height', $(this.el).height());
        this.toggleMore(0);
      } else {
        $(this.el).find('.more').css('display', 'none');
      }
    },

    updateSprintStoryStatus: function() {
      $(this.el).find('.status').html( $(JST['sprints/sprint-story']({ model: this.model })).find('.status') );
      this.setStatusHover();
      this.setEditableState();
    },

    setStatusHover: function() {
      App.Views.Helpers.setStatusHover.apply(this, arguments);
    },

    statusChangeClick: function() {
      App.Views.Helpers.statusChangeClick.apply(this, arguments);
    },

    setEditableState: function() {
      if (this.model.IsEditable()) {
        $(this.el).removeClass('locked');
      } else {
        $(this.el).addClass('locked');
      }
    },

    toggleMore: function(speed) {
      var delay = isNaN(parseInt(speed)) ? 'fast' : speed,
          that = this;
      $(this.el).find('.more').css('display', 'block');
      if ($(this.el).css('height') === this.contractedHeight + 'px') {
        $(this.el).animate({ height: $(this.el).data('original-height') }, delay, null, that.parentView.positionStoriesContainerOnScroll);
        $(this.el).find('.more').addClass('less').find('.tab').text('less');
      } else {
        $(this.el).animate({ height: this.contractedHeight + 'px' }, delay, null, that.parentView.positionStoriesContainerOnScroll);
        $(this.el).find('.more').removeClass('less').find('.tab').text('more');
      }
    },

    moveStory: function() {
      $(this.el).removeClass('hover'); // see IE issue http://stackoverflow.com/questions/7891761/
      if ($(this.el).parents('.stories-container .cards').length == 0) {
        // moving to bottom of sprint
        this.parentView.$('.stories-container .cards').append(this.el);
      } else {
        // moving back to top of backlog
        this.parentView.$('.unassigned-stories-container').prepend(this.el);
      }
      this.parentView.persistSprintStories();
    }
  })
};