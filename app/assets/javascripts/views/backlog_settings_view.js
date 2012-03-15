/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogSettings = {
  Show: App.Views.BaseView.extend({
    tagName: 'section',
    className: 'content',
    stateHtml: false, // keeps state of HTML so we can determine if user has made changes and can ask to keep changes

    initialize: function() {
      App.Views.BaseView.prototype.initialize.call(this);
      this.sprintTabsView = this.options.sprintTabsView;
      _.bindAll(this, 'storeBacklogSettings', 'retrieveBacklogSettings', 'deleteSprint', 'storeState', 'stateChanged', 'restoreState', 'updateSprint', 'cancel');
    },

    render: function() {
      if (this.model.get('iteration') === 'Backlog') {
        this.retrieveBacklogSettings();
        App.Views.BacklogCreateUpdateMethods.initializeManageBacklog(); // special non name spaced method to access manage_backlog.js initialize
        this.el = $('section.content .backlog-settings-body');
      } else {
        this.storeBacklogSettings();
        // these 2 areas fall outside the view technically
        $('section.title h1').html('Sprint ' + this.model.get('iteration') + ' settings');
        this.showSprintDeletePanel();
        $('section.side-panel a.delete-sprint').click(this.deleteSprint); // outside of the view DOM element
        this.el = $('section.content .backlog-settings-body').html(JST['templates/sprints/edit-sprint']({ model: this.model, backlog: this.model.Backlog() }));
        this.$('#start-on').datepicker().datepicker("setDate", parseRubyDate(this.model.get('start_on')));
        this.$('a#sprint_submit').click(this.updateSprint);
        this.$('a#sprint_cancel').click(this.cancel);

        this.disableFieldsIfNotEditable();

        this.$('form').validate(App.Views.SharedSprintSettings.formValidationConfig);

        App.Views.SharedSprintSettings.addFormBehaviour(this.$('form'), this.model.Backlog().get('velocity'));
      }
      this.storeState();
      return this;
    },

    showSprintDeletePanel: function() {
      $('section.side-panel').html(JST['templates/sprints/sprint-delete-panel']({ model: this.model }));
    },

    // store the state of the current tab's HTML so we can check if changes have been made or not
    storeState: function() {
      this.stateHtml = $(this.el).clone();
    },

    // if we have a previous state then return true if HTML has changed
    // if no previous state, return false
    stateChanged: function() {
      return !this.stateHtml || haveFormElementValuesChanged(this.el, this.stateHtml);
    },

    restoreState: function() {
      $(this.el).replaceWith(this.stateHtml);
    },

    // keep a deep copy of the static Backlog elements relevant to this page
    storeBacklogSettings: function() {
      if (!App.Views.BacklogSettings.fragments) {
        // only store if not already stored
        App.Views.BacklogSettings.fragments = {
          'section.title .heading': false,
          'section.side-panel': false,
          'section.main-content-pod .backlog-settings-body': false
        };
        _(App.Views.BacklogSettings.fragments).each(function(val, key) {
          App.Views.BacklogSettings.fragments[key] = $(key).clone();
        });
      }
    },

    // replace static Backlog elements with their original content, typically generated by a static page
    retrieveBacklogSettings: function() {
      if (App.Views.BacklogSettings.fragments) {
        // only retrieve if not already retrieved or already visible (i.e. multiple clicks on the backlog tab)
        _(App.Views.BacklogSettings.fragments).each(function(val, key) {
          $(key).replaceWith(App.Views.BacklogSettings.fragments[key]);
        });
      }
      delete App.Views.BacklogSettings.fragments;
    },

    deleteSprint: function(event) {
      var view = this;
      event.preventDefault();
      $('#dialog-delete-sprint').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/sprints/delete-sprint-dialog']({ iteration: this.model.get('iteration') }));
      $('#dialog-delete-sprint').dialog({
        resizable: false,
        height:170,
        modal: true,
        buttons: {
          'Delete': function() {
            var dialog = this;
            $(this).find('>p').html('Deleting sprint, please wait<br /><br /><span class="progress-icon"></span>');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Close');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
            view.model.destroy({
              success: function() {
                new App.Views.Notice({ message: 'Sprint number ' + view.model.get('iteration') + ' has been deleted'});
                view.sprintTabsView.destroy(view.model, function() {
                  $(dialog).dialog("close");
                });
              },
              error: function(model, error) {
                var message;
                try {
                  message = JSON.parse(error.responseText).message;
                } catch(e) { };
                if (message) {
                  new App.Views.Error({ message: message });
                } else {
                  new App.Views.Error({ message: 'Internal error, unable to delete sprint'});
                }
                $(dialog).dialog("close");
              }
            });
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    },

    saveSprintError: function(model, error) {
      var errorView, message;
      if (window.console) { console.log(JSON.stringify(error)); }
      try {
        message = JSON.parse(error.responseText).message;
      } catch(e) { }
      if (message) {
        this.$('#form-errors').addClass('form_errors').html("Oops, we could not update the sprint as it looks like you haven't filled in everything correctly:<br/>" +
          message.replace('Validation failed: Completed at ', '')).hide().slideDown();
        errorView = new App.Views.Warning({ message: 'Sprint was not updated.  Please address problems and try again'});
      } else {
        // dialog has since been closed, show an error in usual notice area
        errorView = new App.Views.Error({ message: 'An internal error occured and the sprint was not updated.  Please refresh your browser'});
      }
    },

    updateSprint: function(event) {
      var view = this;
      event.preventDefault();
      if (!this.$('form').valid()) {
        view.$('#form-errors').addClass('form_errors').html("Oops, we could not update the sprint as it looks like you haven't filled in everything correctly.  Please correct the fields marked in red to continue.").hide().slideDown();
      } else {
        if (this.model.IsComplete()) {
          if (this.$('#sprint_status_completed').is(':checked')) {
            new App.Views.Warning({ message: 'Nothing has changed so nothing has been updated'});
          } else {
            // set as incomplete
            this.model.set({ completed: 'false' });
            this.saveSprintFields(function() {
              view.showSprintDeletePanel();
            });
          }
        } else {
          this.model.set({
            start_on: $.datepicker.formatDate('yy-mm-dd', this.$('#start-on').datepicker('getDate')),
            duration_days: this.$('#duration-days').val()
          });

          if (!this.model.Backlog().get('velocity') || this.$('#use-explicit-velocity').is(':checked')) {
            this.model.set({
              explicit_velocity: this.$('#explicit-velocity').val(),
              number_team_members: null
            });
          } else {
            this.model.set({
              explicit_velocity: null,
              number_team_members: this.$('#number-team-members').val()
            });
          }

          if (this.$('#sprint_status_completed').is(':checked')) {
            this.model.save(false,
              {
                success: function() {
                  // need to save and then mark as complete as cannot save fields when completed
                  // now mark as complete and save as all other fields ignored on first save
                  view.model.set({ completed: 'true' });
                  view.saveSprintFields(function() {
                    view.showSprintDeletePanel();
                  });
                },
                error: function(model, error) {
                  view.saveSprintError(model, error);
                }
              }
            );
          } else {
            // just save the form changes
            this.saveSprintFields();
          }
        }
      }
    },

    // Save the fields (not the status) to the database and update the view accordingly
    saveSprintFields: function(callbackOnSuccess) {
      var view = this;

      this.model.save(false, {
        success: function() {
          new App.Views.Notice({ message: 'Sprint number ' + view.model.get('iteration') + ' has been updated'});
            view.$('#form-errors').removeClass('form_errors');
            view.storeState(); // so dialog does not appear asking if we want to save changes as already saved
            view.disableFieldsIfNotEditable();
          if (_.isFunction(callbackOnSuccess)) {
            callbackOnSuccess();
          }
        },
        error: function(model, error) {
          view.saveSprintError(model, error);
        }
      });
    },

    disableFieldsIfNotEditable: function() {
      var fields = this.$('#number-team-members, #start-on, #duration-days, #explicit-velocity, input[name=calculation_method]'),
          inputs = this.$('input[type=radio][name=sprint_status]');
      if (!this.model.IsEditable()) { // might not be editable because sprint is complete
        fields.attr('disabled', true);
      } else {
        fields.attr('disabled', false);
      }

      if (!this.model.CanEdit()) { // user does not have permission to edit
        inputs.attr('disabled', true);
      }
    },

    cancel: function(event) {
      event.preventDefault();
      document.location.href = $('#back-to-backlog').attr('href');
    }
  })
};