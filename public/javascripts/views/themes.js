/*global $, _, App, event, JST, Backbone, Story */ // for jslint.com

App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes",
    childId: function(model) { return 'theme-' + model.get('id'); },

    events: {
      "click ul.themes .actions a.new-theme": "createNew",
      "keydown ul.themes .actions a.new-theme": "themeKeyPress"
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

        /* when a user clicks start re-ordering hide all the unnecessary elements include all stories to make the row as shallow as possible */
        this.$('ul.themes .actions .reorder-themes').click(function(event) {
          if ($('ul.themes li.theme').length < 2) {
            new App.Views.Warning({ message: 'You need more than one theme to reorder'});
          } else {
            parentView.$('ul.stories,.theme-stats,ul.themes .delete-theme,ul.themes .theme-data .code,ul.themes>li.actions').slideUp(250, function() {
              parentView.$('.move-theme').css('display', 'block');
              parentView.$('.stop-ordering').css('display', 'block');
            });
          }
        });
        /* ordering has finished as user clicked on stop ordering link */
        this.$('>.stop-ordering').click(function(event) {
          parentView.$('.move-theme').css('display', 'none');
          parentView.$('.stop-ordering').css('display', 'none');
          parentView.$('ul.stories,.theme-stats,ul.themes .delete-theme,ul.themes .theme-data .code,ul.themes>li.actions').slideDown(250);
        })
      } else {
        this.$('ul.themes>li.actions').remove();
      }
      return(this);
    },

    createNew: function(event) {
      event.preventDefault();
      var model = new Theme();
      this.collection.add(model);
      this.$('ul.themes li:last').before(new App.Views.Themes.Show({ model: model}).render().el);
      var this_view = this;
      this_view.$('ul.themes li.theme:last').css('display','none').slideDown('fast', function() {
        $(this_view.el).find('ul.themes li.theme:last>.theme-data .name .data').click();
      });
    },

    themeKeyPress: function(event) {
      if (9 == event.keyCode) { // tab pressed
        if (event.shiftKey) { // <-- moving back
          event.preventDefault();
          if (this.$('li.theme').length > 0) { // one or more themes exist
            var lastTheme = $('li.theme:last');
            if (lastTheme.has('li.actions a.new-story').length) {
              lastTheme.find('li.actions a.new-story').focus();
            } else {
              lastTheme.find('.theme-data .name .data').click();
            }
          } else {
            $('#backlog-data-area h2.name .data').click(); // focus on backlog name
          }
        }
        // do nothing as moving forwards, browser will move to re-order themes button anyway
      } else if (13 == event.keyCode) { // enter pressed
        this.createNew(event);
      }
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
    deleteDialogTemplate: 'themes/delete-dialog',

    events: {
      "click .delete-theme>a": 'remove',
      "click .re-number-stories a": 'reNumberStories'
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'navigateEvent', 'reNumberStoriesAction');
    },

    render: function() {
      $(this.el).html( JST['themes/show']({ model: this.model }) );
      var view = new App.Views.Stories.Index({ collection: this.model.Stories() });
      this.$('>.stories').prepend(view.render().el);

      this.updateStatistics();

      if (this.model.IsEditable()) {
        this.makeFieldsEditable();

        var self = this;
        _.each(['.name', '.code'], function(elem) {
          self.$('.theme-data ' + elem + '>.data, .theme-data ' + elem + '>.data input').live('keydown', self.navigateEvent); // make all input and textarea fields respond to Tab/Enter
        });
        this.$('ul.stories li.actions a.new-story').live('keydown', this.navigateEvent); // hook up the add story button
      } else {
        this.$('ul.stories>li.actions').remove();
        this.$('.re-number-stories a').remove();
        this.$('.delete-theme>a').remove();
      }
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
    navigateEvent: function(event) {
      if (_.include([9,13,27], event.keyCode)) { // tab, enter, esc
        $(event.target).blur();
        try { // cannot preventDefault if esc as esc event is triggered manually from jeditable
          event.preventDefault();
        } catch (e) { }

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
        this.updateStatistics(); // force update in case name has changed
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
        if (!this.$('ul.stories li.actions .new-story').length) {
          // not yet added the Add Story button as theme not created so add now
          if (!this.model.isNew()) {
            this.$('>.stories ul.stories').append(JST['stories/new']()).find('.actions a').focus();
          }
        }
      }
      if (eventName == 'change:id') {
        $(this.el).attr('id', 'theme-' + model.get('id'));
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
      this.$('.theme-stats div').html( JST['themes/stats']({ model: this.model }) )
    },

    reNumberStories: function(event) {
      var view = this;
      event.preventDefault();
      $('#dialog-re-number').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['themes/re-number-dialog']({ }));
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
        error: function() {
          new App.Views.Error({ message: 'Server error trying to renumber stories'});
          $(dialog).dialog("close");
        }
      });
    }
  })
};