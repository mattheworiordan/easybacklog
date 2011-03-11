App.Views.AcceptanceCriteria = {
  Index: Backbone.View.extend({
    tagName: 'div',
    className: 'acceptance-criteria',
    childId: function(model) { return 'acceptance-criteria-' + model.get('id') },

    initialize: function() {
      this.collection = this.options.collection;
      _.bindAll(this, 'orderChanged');
    },

    render: function() {
      var parentView = this;
      $(this.el).html(JST['acceptance_criteria/index']({ collection: this.collection.models }));

      this.collection.each(function(model) {
        var view = new App.Views.AcceptanceCriteria.Show({ model: model, id: parentView.childId(model) });
        parentView.$('ul').append(view.render().el);
      })

      var orderChangedEvent = this.orderChanged;
      this.$('ul.acceptance-criteria').disableSelection().sortable({
        stop: function(event, ui) {
          // stop jeditable from assuming the element needs to now be editable as this item has just been dragged
          $(event.originalEvent.target).data('disabled.editable.once','true').find('.data').data('disabled.editable.once','true');
          orderChangedEvent();
        },
        placeholder: 'target-order-highlight'
      });
      // sortable interferes with jeditable, so have to attach new blur events strangel
      this.$('ul.acceptance-criteria li input').live('blur', function(event) {
        _.delay(function() { if ($(event.target).length) { $(event.target).blur(); } }, 200); // no idea what is going on, reloads page unless there is a delay
      })
      return(this);
    },

    orderChanged: function() {
      var orderIndexesWithIds = {};
      this.$('li.criterion').each(function(index, elem) {
        var elemId = _.last($(elem).attr('id').split('-'));
        orderIndexesWithIds[elemId] = index + 1;
      });
      console.log('Order changed and saving - ' + JSON.stringify(orderIndexesWithIds));
      this.collection.saveOrder(orderIndexesWithIds);
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
        } else {
          return ac_view.contentUpdated(newVal, arguments[1], this);
        }
      };
      var beforeChangeFunc = function() { return ac_view.beforeChange(arguments[0], arguments[1], this); };
      var defaultOptions = _.extend(_.clone(this.defaultEditableOptions), { data: beforeChangeFunc, lesswidth: 10 });

      $(this.el).find('>div').editable(contentUpdatedFunc, defaultOptions);
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