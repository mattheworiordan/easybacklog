App.Views.AcceptanceCriteria = {
  Index: Backbone.View.extend({
    tagName: 'div',
    className: 'acceptance-criteria',
    childId: function(model) { return 'acceptance-criteria-' + model.get('id') },

    events: {
      "click .actions a.new-acceptance-criterion": "createNew",
    },

    initialize: function() {
      this.collection = this.options.collection;
      _.bindAll(this, 'orderChanged', 'displayOrderIndexes');
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['acceptance_criteria/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.AcceptanceCriteria.Show({ model: model, id: parentView.childId(model), parentView: parentView });
        parentView.$('ul').append(view.render().el);
      })

      this.$('ul').append(JST['acceptance_criteria/new']());

      var orderChangedEvent = this.orderChanged;
      this.$('ul.acceptance-criteria').disableSelection().sortable({
        stop: function(event, ui) {
          // stop jeditable from assuming the element needs to now be editable as this item has just been dragged
          $(event.originalEvent.target).data('disabled.editable.once','true').find('.data').data('disabled.editable.once','true');
          orderChangedEvent();
        },
        placeholder: 'target-order-highlight',
        axis: 'y',
        handle: '.index'
      });
      this.displayOrderIndexes();
      return(this);
    },

    createNew: function(event) {
      event.preventDefault();
      var lastCriterion = this.$('li.criterion:last');
      var model = new AcceptanceCriterion();
      var this_view = this;
      this.collection.add(model);
      var newElem = new App.Views.AcceptanceCriteria.Show({ model: model, parentView: this }).render().el;

      if ( (lastCriterion.find('.data textarea').length) && (lastCriterion.find('.data textarea').val() == '') ) {
        // we have to delay this because we have to wait for the empty item which has lost focus to dissapear
        _.delay(function() {
          this_view.$('ul li:last').before(newElem);
          this_view.displayOrderIndexes();
          $(newElem).find('.data').click();
        }, 250);
      } else {
        this.$('ul li:last').before(newElem);
        this.displayOrderIndexes();

        this.$('ul li.criterion:last').css('display','none').slideDown('fast', function() {
          $(newElem).find('.data').click(); // put focus onto new added element
        });
      }
    },

    orderChanged: function() {
      var orderIndexesWithIds = {};
      this.$('li.criterion').each(function(index, elem) {
        var elemId = _.last($(elem).attr('id').split('-'));
        orderIndexesWithIds[elemId] = index + 1;
      });
      console.log('Order changed and saving - ' + JSON.stringify(orderIndexesWithIds));
      this.collection.saveOrder(orderIndexesWithIds);
      this.displayOrderIndexes();
    },

    // instead of using an ordered list which presented issues with drag handles
    //  we use div.index where we manually insert the index
    displayOrderIndexes: function() {
      this.$('li.criterion').each(function(index, elem) {
        $(elem).find('.index').html((index + 1) + '.');
      });
    }
  }),

  Show: App.Views.BaseView.extend({
    tagName: 'li',
    className: 'criterion',

    events: {},

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      _.bindAll(this, 'moveEvent');
    },

    render: function() {
      $(this.el).html( JST['acceptance_criteria/show']({ model: this.model }) );

      this.makeFieldsEditable();
      this.$('.data input, .data textarea').live('keydown', this.moveEvent); // make all input and textarea fields respond to Tab/Enter
      return (this);
    },

    changeEvent: function(eventName, model) {
      if (eventName == 'change:id') {
        $(this.el).attr('id', 'acceptance-criteria-' + model.get('id'));
      }
    },

    makeFieldsEditable: function() {
      var ac_view = this;
      // Acceptance criteria behave differently to other views as they automatically
      //  delete themselves if empty
      var contentUpdatedFunc = function() {
        var newVal = arguments[0];
        var model_collection = ac_view.model.collection;
        if (_.isEmpty(newVal)) {
          $(ac_view.el).slideUp('fast', function() {
            $(ac_view.el).remove(); // remove HTML for story
            if (ac_view.model.isNew()) {
              model_collection.remove(ac_view.model);
            } else {
              ac_view.model.destroy({
                error: function(model, response) {
                  var errorMessage = 'Unable to delete story...  Please refresh.'
                  try {
                    errorMessage = eval('responseText = ' + response.responseText).message;
                  } catch (e) { console.log(e); }
                  new App.Views.Error({ message: errorMessage});
                }
              });
            };
            ac_view.parentView.displayOrderIndexes();
          })
        } else {
          return ac_view.contentUpdated(newVal, arguments[1], this);
        }
      };
      var beforeChangeFunc = function() { return ac_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc, type: 'textarea' });

      $(this.el).find('>div.data').editable(contentUpdatedFunc, defaultOptions);
    },

    // Tab or Enter key pressed so let's move on
    moveEvent: function(event) {
      if (_.include([9,13], event.keyCode)) {
        event.preventDefault();
        $(event.target).blur();

        var liElem = $(event.target).parents('.data').parent();
        if (!event.shiftKey) { // moving -->
          if ( _.first(liElem) != _.last(liElem.parent('ul').find('li.criterion')) ) {
            // move to next item
            liElem.next().find('.data').click();
          } else {
            // move back to comments field
            $(this.el).parents('li.story').find('div.comments .data').click();
          }
        } else { // moving <--
          if ( _.first(liElem) == _.first(liElem.parent('ul').find('li.criterion')) ) {
            // move to user story field so-i-can
            $(this.el).parents('li.story').find('div.so-i-can .data').click();
          } else {
            liElem.prev().find('.data').click();
          }
        }
      }
    }
  })
};