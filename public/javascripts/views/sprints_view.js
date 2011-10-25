/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.Sprints = {
  Show: App.Views.BaseView.extend({
    events: {
      "click .stories-divider .change-size": "toggleUnassignedStoriesSize"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'toggleMore');
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
        var view = new App.Views.Sprints.SprintStory({ model: model.Story(), parentView: that });
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
            var view = new App.Views.Sprints.SprintStory({ model: story, parentView: that });
            $(that.el).find('.unassigned-stories-container').append(view.render().el);
          }
        });
      });

      // allow drag & drop of stories
      this.$('.stories-container, .unassigned-stories-container').sortable({
        connectWith: ".story-droppable"
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
    }
  }),

  SprintStory: App.Views.BaseView.extend({
    tagName: 'div',
    className: 'story-card',
    contractedHeight: 110,

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

      // set heights of story cards to no greater than contractedHeight
      setTimeout(function() {
        that.resetToggle();
      }, 1);
      $(this.el).data('reset-toggle', this.resetToggle);

      // resolve hover issue with IE, see http://stackoverflow.com/questions/7891761/
      $(this.el).hover(function() {
        $(this).addClass('hover');
      }, function() {
        $(this).removeClass('hover');
      })
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
    }
  })
};