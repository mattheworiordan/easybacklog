App.Views.Stories = {
  Index: Backbone.View.extend({
    tagName: 'div',
    className: 'stories',
    childId: function(model) { return 'story-' + model.get('id') },

    initialize: function() {
      this.collection = this.options.collection;
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['stories/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.Stories.Show({ model: model, id: parentView.childId(model) });
        parentView.$('>ul').append(view.render().el);
      })

      return(this);
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'story',
    deleteDialogSelector: '#dialog-delete-story',

    events: {
      "click div.acceptance-criteria ul.acceptance-criteria .actions a.new-acceptance-criterion": "newAcceptanceCriterion",
      "click .delete-story>a": "remove"
    },

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'moveEvent','resizeEvent');
      this.model.bind('resize', this.resizeEvent); // resize event on model triggers view to update itself
    },

    render: function() {
      $(this.el).html( JST['stories/show']({ model: this.model }) );

      var view = new App.Views.AcceptanceCriteria.Index({ collection: this.model.AcceptanceCriteria() });
      this.$('.acceptance-criteria').html(view.render().el);
      this.$('.acceptance-criteria ul.acceptance-criteria').append(JST['acceptance_criteria/new']());

      this.resizeEvent();
      this.makeFieldsEditable();
      // make all input and textarea fields respond to Tab/Enter
      var show_view = this;
      var tabElems = ['.user-story .data', '.unique-id .data', '.comments .data', '.score-50 .data', '.score-90 .data'];
      _.each(tabElems, function(elem) { show_view.$(elem + ' textarea, ' + elem + ' input').live('keydown', show_view.moveEvent); }); 
      return (this);
    },

    makeFieldsEditable: function() {
      var show_view = this;
      var contentUpdatedFunc = function() { return show_view.contentUpdated(arguments[0], arguments[1], this); };
      var beforeChangeFunc = function() { return show_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc });

      this.$('>div.unique-id .data, >div.score-50 .data, >div.score-90 .data').editable(contentUpdatedFunc, defaultOptions);
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
    moveEvent: function(event) {
      if (event.keyCode == 9) {
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
              $(this.el).parents('li.theme').find('>.name .data').click();
            }
          }
        }
      }
    },

    changeEvent: function(eventName, model) {
      if (eventName.substring(0,7) == 'change:') {
        var fieldChanged = eventName.substring(7);
        this.$('>div.' + fieldChanged.replace(/_/gi, '-') + '>div.data').text(this.model.get(fieldChanged));
        App.Controllers.Statistics.updateStatistics(this.model.get('score_statistics'));
      }
    },

    newAcceptanceCriterion: function() {
      event.preventDefault();
      var model = new AcceptanceCriterion();
      this.model.AcceptanceCriteria().add(model);
      var newElem = new App.Views.AcceptanceCriteria.Show({ model: model}).render().el;
      this.$('ul.acceptance-criteria li:last').before(newElem);
      $(newElem).find('.data').click(); // put focus onto new added element
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

    resizeEvent: function() {
      // fix the widths of the DIVs to exactly the widths of the table headers as they fall out of alignment
      var show_view = this;
      $.each(['unique-id','user-story','acceptance-criteria','comments','score-50','score-90'], function(elem, val) {
        show_view.$('>div.' + val).css('width', $('table#themes-header th.' + val).outerWidth());
      });
    }
  })
};