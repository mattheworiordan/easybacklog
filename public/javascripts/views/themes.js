/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",
    childId: function(model) { return 'theme-' + model.get('id'); },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['themes/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Themes.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      });

      return(this);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'theme',
    deleteDialogSelector: '#dialog-delete-theme',

    events: {
      "click div.stories ul.stories .actions a.new-story": "newStory",
      "click .delete-theme>a": "remove"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'moveEvent','resizeEvent');
      this.model.bind('resize', this.resizeEvent); // resize event on model triggers view to update itself
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      this.$('>.stories').prepend(view.render().el);

      // append new story
      if (!this.model.isNew()) { this.$('>.stories ul.stories').append(JST['stories/new']()); }

      this.resizeEvent(); // align to table
      this.makeFieldsEditable();
      this.updateStatistics();
      this.$('.name>.data input').live('keydown', this.moveEvent); // make all input and textarea fields respond to Tab/Enter
      this.$('ul.stories li.actions a.new-story').live('keydown', this.moveEvent); // hook up the add story button

      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc });

      this.$('>.name div.data').editable(contentUpdatedFunc, defaultOptions);
    },

    // Tab or Enter key pressed so let's move on
    moveEvent: function(event) {
      if (event.keyCode == 9) {
        $(event.target).blur();
        event.preventDefault();

        if (!$(event.target).hasClass('new-story')) {
          // Behaviour for Theme view
          if (!event.shiftKey) { // going -->
            // currently on theme name field
            var storyElem = $(this.el).find('li.story:first-child')
            if (storyElem.length) {
              // move to story item
              storyElem.find('.unique-id .data').click();
            } else {
              // focus on next theme button
              $(this.el).next().find('a.new-theme').focus();
              // and if a new story button exists move focus to that
              $(this.el).find('ul.stories li a.new-story').focus();
            }
          } else { // going <--
            var prev = $(this.el).prev();
            if (prev.length) { // previous theme exists
              if (prev.find('ul.stories li.actions a.new-story')) {
                prev.find('ul.stories li.actions a.new-story').focus();
              } else {
                prev.find('>.name .data').click();
              }
            } else { // no previous theme
              $('#backlog-data-area h2.name .data').click();
            }
          }
        } else {
          // Behaviour for new story button
          if (!event.shiftKey) { // going -->
            var nextThemeLi = $(event.target).parents('li.theme').next();
            if (nextThemeLi.hasClass('theme')) {
              // focus on next theme's name
              nextThemeLi.find('>.name .data').click();
            } else {
              // focus on the add theme button as no more themes
              nextThemeLi.find('a.new-theme').focus();
            }
          } else { // going <--
            var previous_story = $(this.el).find('ul.stories li.story:last .score-90 .data'); // JQuery bug, :last-child did not work
            if (previous_story.length) {
              previous_story.click()
            } else {
              $(this.el).find('>.name .data').click();
            }
          }
        }
      }
    },

    newStory: function() {
      event.preventDefault();
      var model = new Story();
      this.model.Stories().add(model);
      this.$('>.stories ul.stories li:last').before(new App.Views.Stories.Show({ model: model}).render().el);
      var this_view = this;
      this_view.$('li.story:last').css('display','none').slideDown('fast', function() {
        this_view.$('li.story:last > .user-story > .as-a > .data').click(); // browser bug, needs to defer, so used animation
      });
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
        if (!this.$('ul.stories li.actions .new-story').length) { // not yet added the Add Story button as theme not created
          if (!this.model.isNew()) { this.$('>.stories ul.stories').append(JST['stories/new']()); }
        }
      }
    },

    deleteAction: function(dialog_obj, view) {
      var model_collection = view.model.collection;

      // tell the user we're deleting as it may take a second
      $(dialog_obj).find('>p').html('Deleting story...<br />Please wait.');
      $(dialog_obj).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Close');
      $(dialog_obj).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
      view.model.destroy({
        error: function(model, response) {
          var errorMessage = 'Unable to delete story...'
          try {
            errorMessage = eval('responseText = ' + response.responseText).message;
          } catch (e) { console.log(e); }
          new App.Views.Error({ message: errorMessage});
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
      this.$('.story-stats div').html( JST['themes/stats']({ model: this.model }) )
    },

    resizeEvent: function() {
      // align the outer stories div with all columns other than theme
      this.$('>.stories').css('width', $('table#themes-header').outerWidth() - $('table#themes-header th.theme').outerWidth());
      // fix the widths of the DIVs to exactly the widths of the table headers as they fall out of alignment
      this.$('>.name').css('width', $('table#themes-header th.theme').outerWidth());

      this.model.Stories().each(function(story) { // now resize children stories
        story.trigger('resize');
      });
    }
  })
};