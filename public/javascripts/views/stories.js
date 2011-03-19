App.Views.Stories = {
  Index: Backbone.View.extend({
    tagName: 'div',
    className: 'stories',
    childId: function(model) { return 'story-' + model.get('id') },

    events: {
      "click ul.stories .actions a.new-story": "createNew",
    },

    initialize: function() {
      this.collection = this.options.collection;
      _.bindAll(this, 'orderChanged', 'displayOrderIndexes');
    },

    render: function() {
      var view = this;
      $(this.el).html(JST['stories/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var storyView = new App.Views.Stories.Show({ model: model, id: view.childId(model) });
        view.$('ul.stories').append(storyView.render().el);
      });

      if (!this.collection.theme.isNew()) { this.$('ul.stories').append(JST['stories/new']()); }

      var orderChangedEvent = this.orderChanged;
      var actionsElem;
      // allow stories to be sorted using JQuery UI
      this.$('ul.stories').sortable({
        start: function(event, ui) {
          // hide the new story button when dragging
          actionsElem = view.$('ul.stories>.actions').clone();
          view.$('ul.stories>.actions').remove();
          view.storyDragged = true; // log that a drag has occurred to prevent click event executing on story
          view.$('.move-story .hint').css('visibility','hidden'); // hide the hint when dragging
        },
        stop: function(event, ui) {
          App.Views.Stories.Index.stopMoveEvent = true; // stop the event firing for the move dialog
          orderChangedEvent();
          // show the new story button again
          view.$('ul.stories').append(actionsElem);
          view.$('.move-story .hint').css('visibility','visible'); // allow hint to be visible now
        },
        placeholder: 'target-order-highlight',
        axis: 'y',
        handle: '.move-story'
      });

      return(this);
    },

    createNew: function(event) {
      event.preventDefault();
      var model = new Story();
      this.collection.add(model);
      this.$('ul.stories li:last').before(new App.Views.Stories.Show({ model: model}).render().el);
      var this_view = this;
      this.$('ul.stories li.story:last').css('display','none').slideDown('fast', function() {
        this_view.$('ul.stories li.story:last > .user-story > .as-a > .data').click(); // browser bug, needs to defer, so used animation
      });
    },

    // method is called after JQuery UI re-ordering
    orderChanged: function() {
      var orderIndexesWithIds = {};
      this.$('li.story').each(function(index, elem) {
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
    className: 'story',
    deleteDialogSelector: '#dialog-delete-story',

    events: {
      "click .delete-story>a": "remove"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'navigateEvent', 'moveToThemeDialog', 'moveToTheme');
    },

    render: function() {
      $(this.el).html( JST['stories/show']({ model: this.model }) );

      var view = new App.Views.AcceptanceCriteria.Index({ collection: this.model.AcceptanceCriteria() });
      this.$('.acceptance-criteria').html(view.render().el);

      this.makeFieldsEditable();
      // make all input and textarea fields respond to Tab/Enter
      var show_view = this;
      var tabElems = ['.user-story .data', '.unique-id .data', '.comments .data', '.score-50 .data', '.score-90 .data'];
      _.each(tabElems, function(elem) { show_view.$(elem + ' textarea, ' + elem + ' input').live('keydown', show_view.navigateEvent); });

      this.$('.move-story a').mousedown(function(event) {
        App.Views.Stories.Index.stopMoveEvent = false; // unless changed to true when dragged, don't stop this move event
      }).click(function(event) {
        event.preventDefault();
        if (!App.Views.Stories.Index.stopMoveEvent) {
          show_view.moveToThemeDialog();
        }
      });

      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function(value, settings) { return show_view.contentUpdated(value, settings, this); }
      var beforeChangeFunc = function(value, settings) { return show_view.beforeChange(value, settings, this); }
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc });

      // for unique ID, we need to remove the code before editing and insert back in after editing
      var uniqueIdContentUpdatedFunc = function(value, settings) { return (show_view.model.Theme().get('code') + contentUpdatedFunc.call(this, value, settings)); }
      var uniqueIdBeforeChangeFunc = function(value, settings) { return beforeChangeFunc.call(this, value.substring(3), settings); }
      var uniqueIdOptions = _.extend(_.clone(defaultOptions), { data: uniqueIdBeforeChangeFunc });
      this.$('>div.unique-id .data').editable(uniqueIdContentUpdatedFunc, uniqueIdOptions);

      this.$('>div.score-50 .data, >div.score-90 .data').editable(contentUpdatedFunc, defaultOptions);
      this.$('>div.comments .data').editable(contentUpdatedFunc, _.extend(_.clone(defaultOptions), { type: 'textarea', saveonenterkeypress: true } ));
      // make the user story fields less wide so they fit with the heading
      _.each(['as-a','i-want-to','so-i-can'], function(elem) {
        _.defer(function() { // wait until elements have rendered
          var width = show_view.$('>div.user-story .' + elem + ' .heading').outerWidth() + 10;
          var options = _.extend(_.clone(defaultOptions), { type: 'textarea', saveonenterkeypress: true, lesswidth: width });
          show_view.$('>div.user-story .' + elem + ' .data').editable(contentUpdatedFunc, options);
        });
      });
    },

    // Tab or Enter key pressed so let's move on
    navigateEvent: function(event) {
      if (_.include([9,13], event.keyCode)) {
        event.preventDefault();
        $(event.target).blur();

        // set up array of all elements in this view in the tab order
        var viewElements = [
          'unique-id .data',
          'as-a .data',
          'i-want-to .data',
          'so-i-can .data',
          'acceptance-criteria ul.acceptance-criteria li:first-child>*',
          'comments .data',
          'score-50 .data',
          'score-90 .data'
        ];

        var dataClass = $(event.target).parents('.data').parent().attr('class');
        var dataElem = _.detect(viewElements, function(id) { return (_.first(id.split(' ')) == dataClass); });

        if (dataElem) { // user has tabbed from a data element
          if (!event.shiftKey) { // moving -->
            if (dataElem != _.last(viewElements)) {
              // move to next element
              this.$('.' + viewElements[_.indexOf(viewElements, dataElem) + 1]).click();
            } else {
              // move onto next view as we're at the last element
              var sibling = $(this.el).next();
              if (sibling.find('a.new-story').length) {
                // just a new story button
                sibling.find('a.new-story').focus();
              } else {
                sibling.find('.' + _.first(viewElements)).click();
              }
            }
          } else { // moving --<
            if (dataElem != _.first(viewElements)) {
              // move to previous element
              var previousSelector = viewElements[_.indexOf(viewElements, dataElem) - 1];
              if (previousSelector.indexOf('acceptance-criteria') == 0) {
                // exception, we need to move to acceptance criteria
                var lastCriterion = this.$('.acceptance-criteria ul.acceptance-criteria li.criterion:last>*');
                if (lastCriterion.length) {
                  // a criterion exists, jump to this
                  lastCriterion.click();
                } else {
                  // create a new blank criteria
                  this.$('.acceptance-criteria ul.acceptance-criteria li:last a').click();
                }
              } else {
                this.$('.' + previousSelector).click();
              }
            } else {
              // move to theme field name
              if ($(this.el).prev().length) {
                // jump to end of previous story
                $(this.el).prev().find('.score-90 .data').click();
              } else {
                // no previous stories so jump to theme
                $(this.el).parents('li.theme').find('.theme-data >.name .data').click();
              }
            }
          }
        }
      }
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        var newValue = this.model.get(fieldChanged);
        if (fieldChanged == 'unique_id') {
          // check if field is being edited as we tab straight from code to unique_id
          if (this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data input').length == 0)
          {
            // unique_id is not being edited so updated with new value
            newValue = this.model.Theme().get('code') + newValue;
            this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(newValue);
          } else {
            // unique_id is being edited, so just update the ID as no code is shown when editing unique_id
            this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data input').val(newValue);
          }
        } else {
          this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(newValue);
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

    // user has clicked move so ask them where we are moving to
    moveToThemeDialog: function() {
      console.log('Requested to move');
      var view = this;
      $('#dialog-move-story').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['stories/move-dialog']({ story: this.model, themes: this.model.Theme().Backlog().Themes() }));
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
        console.log('Moving to theme-' + themeId);
        $(this.el).insertBefore($('li.theme#theme-' + themeId + ' ul.stories>li:last'));
        this.model.MoveToTheme(themeId, {
          success: function(model, response) {
            new App.Views.Notice({ message: 'The story was moved successfully.'});
          },
          error: function() {
            new App.Views.Error({ message: 'The story move failed.  Please refresh your browser.'});
          }
        });
      }
      $(dialog).dialog("close");
    }
  })
};