/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",
    childId: function(model) { return 'theme-' + model.get('id'); },

    events: {
      "click ul.themes .actions a.new-theme": "createNew"
    },

    initialize: function() {
      this.collection = this.options.collection;
      _.bindAll(this, 'orderChanged', 'displayOrderIndexes');
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['themes/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Themes.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      });

      this.$('ul.themes').append(JST['themes/new']());

      var orderChangedEvent = this.orderChanged;
      var actionsElem;
      // allow themes to be sorted using JQuery UI
      this.$('ul.themes').disableSelection().sortable({
        start: function(event, ui) {
          // hide the new theme button when dragging
          // actionsElem = parentView.$('ul.themes>.actions').clone();
          // parentView.$('ul.themes>.actions').remove();
        },
        stop: function(event, ui) {
          orderChangedEvent();
          // show the new theme button again
          parentView.$('ul.themes').append(actionsElem);
        },
        placeholder: 'target-order-highlight',
        axis: 'y',
        handle: '.move-theme'
      });

      /* when a user clicks start re-ordering hide all the unnecessary elements include all stories to make the row as shallow as possible */
      this.$('ul.themes .actions .reorder-themes').click(function(event) {
        parentView.$('ul.stories,.story-stats,ul.themes .delete-theme,ul.themes .theme-data .code,ul.themes>li.actions').slideUp(250, function() {
          parentView.$('.move-theme').css('display', 'block');
          parentView.$('.stop-ordering').css('display', 'block');
        });
      });
      /* ordering has finished as user clicked on stop ordering link */
      this.$('>.stop-ordering').click(function(event) {
        parentView.$('.move-theme').css('display', 'none');
        parentView.$('.stop-ordering').css('display', 'none');
        parentView.$('ul.stories,.story-stats,ul.themes .delete-theme,ul.themes .theme-data .code,ul.themes>li.actions').slideDown(250);
      })
      return(this);
    },

    createNew: function() {
      event.preventDefault();
      var model = new Theme();
      this.collection.add(model);
      this.$('ul.themes li:last').before(new App.Views.Themes.Show({ model: model}).render().el);
      var this_view = this;
      this_view.$('ul.themes li.theme:last').css('display','none').slideDown('fast', function() {
        $(this_view.el).find('ul.themes li.theme:last>.theme-data .name .data').click();
      });
    },

    // method is called after JQuery UI re-ordering
    orderChanged: function() {
      var orderIndexesWithIds = {};
      this.$('li.theme').each(function(index, elem) {
        var elemId = _.last($(elem).attr('id').split('-'));
        if (!isNaN(parseInt(elemId))) { // unless story is new and not saved yet
          orderIndexesWithIds[elemId] = index + 1;
        }
      });
      console.log('Order changed and saving - ' + JSON.stringify(orderIndexesWithIds));
      this.collection.saveOrder(orderIndexesWithIds);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'theme',
    deleteDialogSelector: '#dialog-delete-theme',

    events: {
      "click .delete-theme>a": "remove"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'moveEvent');
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      this.$('>.stories').prepend(view.render().el);

      this.makeFieldsEditable();
      this.updateStatistics();
      this.$('.theme-data .name>.data input, .theme-data .code>.data input').live('keydown', this.moveEvent); // make all input and textarea fields respond to Tab/Enter
      this.$('ul.stories li.actions a.new-story').live('keydown', this.moveEvent); // hook up the add story button

      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function(value, settings) {
        var newVal = show_view.contentUpdated(value, settings, this);
        var fieldId = $(this).parent().attr('class').replace(/\-/g, '_');
        if (fieldId == 'code') { // code needs updating of story views
          show_view.model.Stories().each(function(story, index) {
            story.trigger('change:unique_id'); // trigger unique ID change so field is updated
          })
        }
        return (newVal);
      };
      var beforeChangeFunc = function(value, settings) { return show_view.beforeChange(value, settings, this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc });

      this.$('.theme-data .name div.data').editable(contentUpdatedFunc, defaultOptions);
      this.$('.theme-data .code div.data').editable(contentUpdatedFunc, _.extend(defaultOptions, { lesswidth: -10 }));
    },

    // Tab or Enter key pressed so let's move on
    moveEvent: function(event) {
      if (_.include([9,13], event.keyCode)) {
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
            var dataClass = $(event.target).parents('.data').parent().attr('class');
            if (dataClass == 'name') {
              var prev = $(this.el).prev();
              if (prev.length) { // previous theme exists
                if (prev.find('ul.stories li.actions a.new-story')) {
                  prev.find('ul.stories li.actions a.new-story').focus();
                } else {
                  prev.find('.theme-data >.name .data').click();
                }
              } else { // no previous theme
                $('#backlog-data-area h2.name .data').click();
              }
            } else {
              this.$('.theme-data >.name .data').click();
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

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        this.$('>.theme-data>.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
        if (!this.$('ul.stories li.actions .new-story').length) { // not yet added the Add Story button as theme not created
          if (!this.model.isNew()) { this.$('>.stories ul.stories').append(JST['stories/new']()); }
        }
      }
      if (eventName == 'change:id') {
        $(this.el).attr('id', 'theme-' + model.get('id'));
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
    }
  })
};