/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.Sprints = {
  Show: App.Views.BaseView.extend({
    childId: function(model) { return 'sprint-story-' + model.get('id'); },

    events: {
      "click .stories-divider .change-size": "toggleUnassignedStoriesSize"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'toggleMore', 'persistSprintStories');
    },

    render: function() {
      var that = this,
          storiesAssignedToSprints = {};

      // load sprints view
      $(this.el).html(JST['sprints/show']({ model: this.model }));

      // if contracted, then update the sizes of the divs
      that.toggleUnassignedStoriesSize(true);

      // show stories assigned to sprint
      this.model.SprintStories().each(function(model) {
        var view = new App.Views.Sprints.SprintStory({ model: model.Story(), parentView: that, id: that.childId(model.Story()) });
        $(that.el).find('.stories-container').append(view.render().el);
      });

      // get a list of all stories assigned to all sprints
      this.model.collection.each(function(sprint) {
        sprint.SprintStories().each(function(sprintStory) {
          storiesAssignedToSprints[sprintStory.get('story_id')] = sprintStory;
        });
      });

      // now show all stories not yet assigned to a sprint
      var sortFn = function(t) { return t.get('position'); };
      _(this.model.Backlog().Themes().sortBy(sortFn)).each(function(theme) {
        _(theme.Stories().sortBy(sortFn)).each(function(story) {
          if (!storiesAssignedToSprints[story.get('id')]) {
            var view = new App.Views.Sprints.SprintStory({ model: story, parentView: that, id: that.childId(story) });
            $(that.el).find('.unassigned-stories-container').append(view.render().el);
          }
        });
      });

      // allow drag & drop of stories
      this.$('.stories-container, .unassigned-stories-container').sortable({
        connectWith: ".story-droppable",
        stop: this.persistSprintStories,
        placeholder: 'story-card-place-holder'
      }).disableSelection();

      return this;
    },

    toggleUnassignedStoriesSize: function(dontToggle) {
      var storyContainerSizes = [70, 48.5],
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
        this.$('.unassigned-stories-container').animate({ width: (100 - newStoryContainerSize - spaceBetween) + '%' }, 'fast');
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
        this.$('.unassigned-stories-container').css('width', (100 - newStoryContainerSize - spaceBetween) + '%');
        this.$('.stories-divider').css('left', (newStoryContainerSize + dividerOffset) + '%');
        this.$('.unassigned-stories-heading').css('left', (newStoryContainerSize + headingOffset) + '%').css('width', (100 - 0.5 - (newStoryContainerSize + headingOffset)) + '%')

        this.$('.story-card').each(function(index, elem) {
          $(elem).data('reset-toggle')();
        });
      }
    },

    persistSprintStories: function() {
      var that = this;
      // Remove SprintStory models from Sprint that are no longer in the list
      this.model.SprintStories().each(function(story) {
        if (!that.$('.stories-container #' + that.childId(story.Story())).length) {
          story.destroy({
            error: function(model, response) {
              var errorMessage = 'Oops, we\'ve been unable to remove that story from this sprint.  Please refresh your browser.';
              try {
                errorMessage = $.parseJSON(response.responseText).message;
              } catch (e) { if (window.console) { console.log(e); } }
              var errorView = new App.Views.Error({ message: errorMessage});
            }
          });
        }
      });
      this.$('.stories-container .story-card').each(function(index, storyNode) {
        var storyId = Number($(storyNode).attr('id').replace('sprint-story-',''));
        if (!that.model.SprintStories().getByStoryId(storyId)) {
          // we need to persist this sprint story as it's not in the SprintStories collection
          var newSprintStory = new SprintStory({
            story_id: $(storyNode).data('story_id'),
            sprint_id: that.model.get('id')
          });
          that.model.SprintStories().add(newSprintStory);
          newSprintStory.save(false, {
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
      $('section.main-content-pod').before(this.pod);
    },

    addSprint: function(event) {
      this.sprintTabsView.createNew(event);
    },

    cleanUp: function() {
      this.pod.remove();
    }
  }),

  SprintStory: App.Views.BaseView.extend({
    tagName: 'div',
    className: 'story-card',
    contractedHeight: 85,

    events: {
      "click .more .tab": "toggleMore",
      "click .move": 'moveStory'
    },

    initialize: function(options) {
      App.Views.BaseView.prototype.initialize.call(this);
      this.parentView = options.parentView;
      _.bindAll(this, 'resetToggle');
    },

    render: function() {
      var that = this;
      $(this.el).html(JST['sprints/sprint-story']({ model: this.model }));

      // set heights of story cards to no greater than contractedHeight, must do after this element has actually rendered in the page
      setTimeout(function() {
        that.resetToggle();
      }, 1);
      $(this.el).data('reset-toggle', this.resetToggle);

      // resolve hover issue with IE, see http://stackoverflow.com/questions/7891761/
      $(this.el).hover(function() {
        $(this).addClass('hover');
      }, function() {
        $(this).removeClass('hover');
      });

      // store data so we can identify this DOM element
      $(this.el).data('story_id', this.model.get('id'));
      return this;
    },

    resetToggle: function() {
      $(this.el).css('height', 'auto');
      if ($(this.el).height() > this.contractedHeight) {
        $(this.el).data('original-height', $(this.el).height());
        this.toggleMore(0);
      } else {
        $(this.el).find('.more').css('display', 'none');
      }
    },

    toggleMore: function(speed) {
      var delay = typeof speed === 'undefined' ? 'fast' : speed;
      $(this.el).find('.more').css('display', 'block');
      if ($(this.el).css('height') === this.contractedHeight + 'px') {
        $(this.el).animate({ height: $(this.el).data('original-height') }, delay);
        $(this.el).find('.more').addClass('less').find('.tab').text('less');
      } else {
        $(this.el).animate({ height: this.contractedHeight + 'px' }, delay);
        $(this.el).find('.more').removeClass('less').find('.tab').text('more');
      }
    },

    moveStory: function() {
      $(this.el).removeClass('hover'); // see IE issue http://stackoverflow.com/questions/7891761/
      var target = $(this.el).parents('.stories-container').length == 0 ? this.parentView.$('.stories-container') : this.parentView.$('.unassigned-stories-container');
      target.append(this.el);
      this.parentView.persistSprintStories();
    }
  })
};