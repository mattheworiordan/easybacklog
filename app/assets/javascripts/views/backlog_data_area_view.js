/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false, htmlEncode:false */

App.Views.BacklogDataArea = {
  Show: App.Views.BaseView.extend({
    events: {
      "click .actions #print": "print",
      "click a#backlog-settings-link": 'backlogSettings'
    },

    initialize: function(options) {
      _.bindAll(this, 'print', 'newSnapshot', 'jumpToSnapshot', 'compareSnapshot', 'sprintsChanged');
      this.model.Sprints().on('change:completed_at', this.sprintsChanged);
    },

    render: function() {
      // select snapshot appears outside of this elem so do this globally
      $('#new-snapshot').click(this.newSnapshot);
      $('#compare-snapshot').click(this.compareSnapshot);
      $('select.snapshot-selector').change(this.jumpToSnapshot);

      // snapshot and filter menu
      this.enableSnapshotsMenu();
      this.enableFilterMenu();

      if (!this.model.IsEditable()) {
        this.$el.addClass('not-editable');
        $('#backlog-container').addClass('not-editable');
        $('#add-sprint').hide();
      }

      return this;
    },

    // sprint changed so we need to update the snapshot drop down
    sprintsChanged: function(model) {
      var that = this;
      var url = document.location.pathname.replace('#.*$', '');
      $.get(url + '/snapshots', false, function(data) {
        $('.snapshot-menu-container .select, #viewing-snapshot-container .selector').html(data);
        $('select.snapshot-selector').change(that.jumpToSnapshot);
      }, 'html');
    },

    // user clicked backlog settings, lets try and take them to the relevant settings page i.e. if they are viewing sprint 1
    //  then show them sprint 1 settings
    backlogSettings: function(event) {
      var link = $(event.target).attr('href'),
          route = document.location.href.match(/(#[\w\d_-]+)$/);
      event.preventDefault();
      document.location.href = link + (route ? route[1] : '');
    },

    enableSnapshotsMenu: function() {
      var overEitherNode = false,
          selectIsOpen = false,
          hideMenu = function() {
            overEitherNode = false;
            if (!selectIsOpen) {
              setTimeout(function() {  // give user a change to move mouse onto either of the nodes, menu or menu container
                if (overEitherNode === false) {
                  $('#backlog-data-area .snapshot').removeClass('hover');
                  $('section.for-backlog .snapshot-menu-container').hide();
                }
              }, 50);
            }
          },
          showMenu = function() {
            $('#backlog-data-area .snapshot').addClass('hover');
            $('section.for-backlog .snapshot-menu-container').show().position({
              of: $('#backlog-data-area .snapshot'),
              my: 'right top',
              at: 'right bottom',
              offset: "0 -8"
            });
            overEitherNode = true;
          };

      // allow click to active menu for testing
      $('#backlog-data-area .snapshot').mouseover(showMenu).click(showMenu).mouseout(hideMenu);
      $('section.for-backlog .snapshot-menu-container').mouseover(function() {
        overEitherNode = true;
      }).mouseout(hideMenu);

      $('.snapshot-menu-container .select select').click(function(event) {
        // when user clicks on drop down, no longer hide the menu even if they move down the drop down off this area (on PC IE)
        // until they click it again and select something
        selectIsOpen = !selectIsOpen;

        event.stopPropagation();
        if (selectIsOpen) {
          $('html').bind('click.snapshotmenu', function() {
            selectIsOpen = false;
            hideMenu();
            $('html').unbind('click.snapshotmenu');
          });
        }
      }).keydown(function() {
        selectIsOpen = false;
      });
    },

    // Need this roll over code simply because a CSS solution would not work as div gets hidden beneath fixed position items
    enableFilterMenu: function() {
      var backlog = App.Collections.Backlogs.at(0),
          overEitherNode = false,
          selectIsOpen = false,
          hideMenu = function() {
            overEitherNode = false;
            if (!selectIsOpen) {
              _.delay(function() {  // give user a chance to move mouse onto either of the nodes, menu or menu container
                if (overEitherNode === false) {
                  $('#backlog-data-area .filter').removeClass('hover');
                  $('#filter-container').hide();
                }
              }, 50);
            }
          },
          showMenu = function() {
            $('#filter').addClass('hover');
            $('#filter-container').show().position({
              of: $('#backlog-data-area .filter'),
              my: 'right top',
              at: 'right bottom',
              offset: "0 -8"
            });
            overEitherNode = true;
          },
          filterChangeEvent = function(event) {
            var isHiding = ($(event.target).is(':checked')),
                filterType = $(event.target).attr('id').replace(/^filter_/, '');

            // uncheck other boxes
            $('#filter-container input[type=checkbox]:not(#' + $(event.target).attr('id') + ')').removeAttr('checked');

            // show filtering notice if filtering
            if (isHiding) {
              $('.filter-notifier').slideDown();
              // store filtering preference for session
              backlog.UserSettings().save({ filter: filterType });
            } else {
              $('.filter-notifier').slideUp();
              // delete the filter preference
              backlog.UserSettings().save({ filter: null });
            }

            // iterate through each story that is completed and hide
            backlog.Themes().each(function(theme) {
              theme.Stories().each(function(story) {
                story.trigger('change:meta_filtered');
              });
            });
          },
          filterNoticeClicked = function(event) {
            event.preventDefault();
            var filterCheckbox = $('#filter-container input[type=checkbox]').removeAttr('checked');
            filterChangeEvent({ target: filterCheckbox });
          };

      // allow click to active menu for testing
      $('#backlog-data-area .filter').mouseover(showMenu).click(showMenu).mouseout(hideMenu);
      $('#filter-container').mouseover(function() {
        overEitherNode = true;
      }).mouseout(hideMenu);

      $('#filter-container input[type=checkbox]').change(filterChangeEvent);
      // event fired from filter notice shown
      $('.filter-notifier a').click(filterNoticeClicked);

      // keep preference in session of whether to show accepted stories or not
      if (backlog.UserSettings().get('filter')) {
        // wait until the page has rendered
        _.delay(function() {
          var filterType = backlog.UserSettings().get('filter'),
              filterCheckbox = $('#filter-container input#filter_' + filterType + '[type=checkbox]').attr('checked', 'checked');
          if (filterCheckbox.length) { // ensure filter is valid before continuing
            filterChangeEvent({ target: filterCheckbox });
            // interface has moved because the notice is showing at the top of the page, so blur the selected item, and show the editable text again
            var focus = $('input[name=value]').parents('.data');
            if (focus) {
              $('input[name=value]').blur();
              _.delay(function() {
                focus.click();
              }, 150);
            }
          }
        }, 750);
      }
    },

    print: function(event) {
      var view = this;
      event.preventDefault();
      $('#dialog-print').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/backlogs/print-dialog']({ backlog: this.model }));
      $('#dialog-print').dialog({
        resizable: false,
        height:350,
        width: 400,
        modal: true,
        buttons: {
          Print: function() {
            // get the page size & fold side values from the select fields
            var page_size = $(this).find('#page-size option:selected').attr('id');
            var fold_side = $(this).find('#fold-side option:selected').attr('id');

            // save the cookie so settings are remembered
            $.cookie("fold-side-default", fold_side);
            $.cookie("page-size-default", page_size);

            // download the PDF in the background
            var printUrl = $(event.target).attr('href');
            printUrl += '?print_scope=' + $(this).find('#print-scope option:selected').attr('id') +
              '&page_size=' + page_size + '&fold_side=' + fold_side;
            document.location.href = printUrl;

            // update the dialog to say we're updating and then close after a short period
            $(this).find('p.progress-placeholder').html('Please wait, we\'re preparing your PDF...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
            $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
            var dialog = this;
            _.delay(function() { $(dialog).dialog("close"); }, 2000);
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
      if (event.theme && event.theme.get('id')) {
        $('#dialog-print #print-scope #theme-' + event.theme.get('id')).attr('selected', true);
      }
      if (event.story && event.story.get('id')) {
        var story = event.story,
            optGroup = $('<optgroup label="Only the chosen story">'),
            opt = $('<option id="story-' + event.story.get('id') + '" selected="SELECTED">' + htmlEncode(story.Theme().get('code') + story.get('unique_id')) + '</option>');
        optGroup.append(opt);
        $('#dialog-print #print-scope').append(optGroup);
      }
    },

    newSnapshot: function(event) {
      var view = this;
      var newSnapshotLink = $(event.target);
      event.preventDefault();
      $('#dialog-create-snapshot').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/backlogs/create-snapshot-dialog']({ backlog: this.model }));
      $('#dialog-create-snapshot').dialog({
        resizable: false,
        height:230,
        width: 350,
        modal: true,
        buttons: {
          'Create Snapshot': function() {
            // create snapshot on server by posting a request
            var name = $(this).find('input[type=text]').val();
            if ($.trim(name) === '') {
              $(this).find('div.progress-area label').text('You must name your snapshot to continue.');
              $(this).find('div.progress-area').addClass('field_with_errors').find('input[type=text]').focus();
            } else {
              // post a hidden form to set up a new snapshot
              var href = newSnapshotLink.attr('href'),
                csrf_token = $('meta[name=csrf-token]').attr('content'),
                csrf_param = $('meta[name=csrf-param]').attr('content'),
                form = $('<form method="post" action="' + href + '"></form>');
              var fields = '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />' +
                '<input name="name" value="' + htmlEncode(name) + '" type="hidden" />';
              form.hide().append(fields).appendTo('body');
              form.submit();

              // update the dialog to say we're updating and then close after a short period
              $(this).find('div.progress-area').html('Please wait, we\'re creating your snapshot...<br /><br />' +
                '<span class="progress-icon"></span>');
              $(this).parent().find('.ui-dialog-buttonset button:nth-child(2) span').text('Preparing...');
              $(this).parent().find('.ui-dialog-buttonset button:nth-child(1)').remove();
            }
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    },

    jumpToSnapshot: function(event) {
      event.preventDefault();
      var val = $(event.target).val(),
          // When running integration tests the option is returned, in a browser the select is returned
          isSprintSnapshot = $(event.target).hasClass('sprint') || $(event.target).find(':selected').hasClass('sprint');

      var baseUrl = document.location.href.match(/^.*\/accounts\/\d+\/backlogs\/\d+/i)[0];
      if (val.match(/^\d+$/)) {
        // user has selected a backlog
        baseUrl += '/snapshots/' + val;
      }
      $('#loading-new-snapshot').show();
      document.location.href = baseUrl;
    },

    compareSnapshot: function(event) {
      var view = this;
      var newSnapshotLink = $(event.target);
      event.preventDefault();
      $('#dialog-compare-snapshot').remove(); // ensure old dialog HTML is not still in the DOM
      $('body').append(JST['templates/backlogs/compare-snapshot-dialog']({ snapshot_options: $('select.snapshot-selector').html() }));
      var currentSnapshot = document.location.pathname.match(/^\/accounts\/\d+\/backlogs\/\d+\/snapshots\/(\d+)/i);
      if (currentSnapshot) {
        // viewing a snapshot now, so set the compare against as the working version
        $('#dialog-compare-snapshot select#target-snapshot').val($('#dialog-compare-snapshot select#target-snapshot option:first-child').val());
      }
      $('#dialog-compare-snapshot').dialog({
        resizable: false,
        height:310,
        width: 400,
        modal: true,
        buttons: {
          'Compare': function() {
            // create snapshot on server by posting a request
            var base = $(this).find('select#base-snapshot').val();
            var target = $(this).find('select#target-snapshot').val();
            if (base == target) {
              $(this).find('div.error-message').html('<p><span class="error-alert ui-icon ui-icon-alert"></span>' +
                'You cannot compare the same snapshots.  Please make another selection.</p>');
            } else {
              var baseUrl = document.location.pathname.match(/^\/accounts\/\d+\/backlogs/i)[0];
              var backlogId = document.location.pathname.match(/^\/accounts\/\d+\/backlogs\/(\d+)/i)[1];
              var url = baseUrl + '/compare/' + (base.match(/^\d+$/) ? base : backlogId) + '/' + (target.match(/^\d+$/) ? target : backlogId);
              if (App.environment === 'test') {
                document.location.href = url;
              } else {
                window.open(url, '_newtab' + Math.floor(Math.random()*10000));
              }
              $(this).dialog("close");
            }
          },

          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    }
  })
};