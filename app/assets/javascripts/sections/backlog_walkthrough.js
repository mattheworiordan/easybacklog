$(function() {
  var nextFn = function() { guiders.next(); },
      unbind = function() { $('*').unbind('.guiders'); };

  // if viewing backlog, then show the guide, else stop here
  if (!$('#backlog-container').is(':visible')) {
    return;
  }

  guiders.createGuider({
    buttons: [{name: "Close"},{name: "Next"}],
    title: "easyBacklog walk through",
    description: "In <b>less than 3 minutes</b> we will walk you through some of the key features of easyBacklog.  <br/><br/>" +
      "<b>Click next (highly recommended for new users)</b> to proceed or close if you don't want to view the walk through.",
    id: "first",
    next: 'themes',
    overlay: true,
    onHide: function() { $('.filter-container input#filter_completed').attr('checked', false).change(); } // ensure filter is not enabled
  });

  guiders.createGuider({
    buttons: [],
    title: "Themes",
    description: "All stories are categorised into themes.  Each theme is automatically assigned a theme code (shown below as '" +
      htmlEncode($("li.theme:first .theme-data .code .data").text()) +
      "') which is used to prefix each story's ID within that theme." +
      "<br><br><b>Click on the theme field '" +
      htmlEncode($("li.theme:first .theme-data .name .data").text()) + "'</b> to the left to edit it now.",
    offset: { left: -20, top: 0 },
    id: "themes",
    next: 'themes.code',
    attachTo: "li.theme:first .theme-data .name .data",
    position: 3,
    onShow: function() { $('li.theme:first .theme-data .name .data').bind('click.guiders', nextFn); },
    onHide: function() { unbind(); }
  });

  guiders.createGuider({
    buttons: [],
    title: "Fields are editable",
    description: "The theme name field is now editable as you have clicked on it - clicking on theme or story fields allows you to edit theme inline.<br><br>Now <b>click on the field '" +
      $("li.theme:first .theme-data .code .data").text() + "' to the right of the text 'Code:'</b> to edit the theme code",
    id: "themes.code",
    next: 'themes.code.edit',
    attachTo: "li.theme:first .theme-data .code .data",
    position: 3,
    onShow: function() { $('li.theme:first .theme-data .code .data').bind('click.guiders', nextFn); },
    onHide: function() { unbind(); }
  });

  guiders.createGuider({
    buttons: [],
    title: "Theme code",
    description: "Now <b>change this field to any 3 letters or digits  and press Enter or Tab</b>, and watch how the code changes cascade down to the stories within this theme.",
    id: "themes.code.edit",
    next: 'themes.code.view',
    attachTo: "li.theme:first .theme-data .code .data",
    offset: { left:20, top: 0 },
    position: 3,
    onShow: function() { $('li.theme:first .theme-data .code .data input').live('blur', nextFn); },
    onHide: function() { $('li.theme:first .theme-data .code .data input').die('blur'); }
  });

  guiders.createGuider({
    title: "Theme code",
    description: "See how the ID for each story is prefixed with the 3 letter code from the theme.  This system of naming stories allows you to easily locate a story by theme and its unique ID.",
    id: "themes.code.view",
    next: 'story.unique_id',
    attachTo: "li.theme:first li.story.locked:first .unique-id .data",
    position: 3,
    offset: { left: -20, top: 0 }
  });

  guiders.createGuider({
    title: "Keyboard navigation",
    description: "Now try pressing Tab &amp; Shift-Tab to navigate forwards and backwards within the story.  <br/><br/>" +
      "If you've mistakenly lost focus of an editable field, simply click on a field in this story to edit it.<br/><br/><b>Keep tabbing forwards until you stop on the 'Add story' button.</b>",
    id: "story.unique_id",
    next: 'story.create',
    attachTo: "li.theme:first li.story:not(.locked):first .unique-id .data",
    position: _.include($("li.theme:first li.story:lt(2)"), $("li.theme:first li.story:not(.locked):first")[0]) ? 6 : 12, // show bubble on top if lower down, or beneath if at the top
    onShow: function() {
      _.delay(function() {
        $('li.theme:first li.story:not(.locked) .unique-id .data').click();
      }, 100);
      $('li.theme:first li.actions a.new-story').bind('focus.guiders', nextFn);
    },
    onHide: function() { unbind(); },
    width: 300
  });

  guiders.createGuider({
    title: "Adding story",
    description: "To add a story at any point to a theme you simply press the 'Add story' button associated with each theme.",
    id: "story.create",
    next: 'story.tools',
    attachTo: "li.theme:first li.actions a.new-story",
    position: 12,
    width: 300,
    overlay: true
  });

  guiders.createGuider({
    title: "Story tools",
    description: "Each story has a set of tools you can click on to do one of the following<ul><li>Assign a colour to a story</li><li>Delete a story</li><li>Duplicate a story</li><li>Move a story</li><li>Assign a story to a sprint</li></ul>Note: Story tools are only visible on editable stories (ones that are not marked as Done).",
    id: "story.tools",
    next: 'story.drag',
    attachTo: "li.theme:first li.story:not(.locked):first .story-actions",
    position: 3,
    overlay: true,
    offset: { left: -50, top: 0 }
  });

  guiders.createGuider({
    title: "Reordering stories",
    description: "Stories can be re-prioritized and ordered by simply dragging them up or down, or clicking on the move tool.<br><br><b>Try dragging this story up now to reorder it</b>",
    id: "story.drag",
    next: 'backlog.total',
    attachTo: "li.theme:first li.story:last",
    offset: { top: 40, left: 0 },
    position: 12,
    onShow: function() {
      // set up drag & drop events for next guider
      $("li.theme:first li.story:last").bind('mousedown.guiders', function() {
        $(this).unbind('mousedown.guiders');
        guiders.hideAll();
      }).bind('mouseup.guiders', function() {
        guiders.show('backlog.total');
        $(this).unbind('mouseup.guiders');
      });
    }
  });

  guiders.createGuider({
    title: 'Backlog totals',
    description: 'The total points within your backlog is shown here.  If you are using cost and day estimates, then the total estimated man days and cost based on your day rate will be shown.',
    id: 'backlog.total',
    next: 'backlog.export',
    attachTo: '#backlog-data-area .backlog-stats',
    position: 6,
    width: 330
  });

  guiders.createGuider({
    title: 'Exporting and Printing',
    description: 'You can <b>Export</b> your entire backlog into Microsoft Excel format.<br><br>And you can <b>Print</b> double-sided story cards that can be placed on your scrum boards.',
    id: 'backlog.export',
    next: 'backlog.filter',
    attachTo: '#backlog-data-area .actions a:contains(Export)',
    position: 6,
    width: 330
  });

  guiders.createGuider({
    buttons: [],
    title: 'Filtering Done Stories',
    description: 'When stories are assigned to sprints, they will be assigned a status such as To Do, In Progress or Done.  When viewing and editing the backlog, it is often useful to filter out all Done stories so that you can see which stories are still remaining.' +
      "<br><br><b>Now roll over 'Filter' above, and click on 'Hide completed stories' to filter out all Done stories</b>",
    id: 'backlog.filter',
    next: 'backlog.filtered',
    attachTo: '#backlog-data-area .actions a:contains(Filter)',
    position: 6,
    width: 330,
    offset: { top: 20, left: 0},
    onShow: function() { $('.filter-container input#filter_completed').attr('checked', false).change().bind('change.guiders', function() { nextFn(); }) },
    onHide: function() { unbind(); }
  });

  guiders.createGuider({
    title: 'Filtered view',
    description: "As you can now see, all the stories that were previously marked as Done are no longer visible in the backlog.<br><br>" +
      "<b>Now click on the 'Remove filter' link above to remove the filter.</b>",
    id: 'backlog.filtered',
    next: 'backlog.tab',
    attachTo: '#backlog-container .filter-notifier:first',
    position: 6,
    width: 330,
    offset: { top: 20, left: 0 },
    onShow: function() { $('#backlog-container .filter-notifier a').bind('click.guiders', function() { nextFn(); }); },
    onHide: function() { unbind(); $('.filter-container input#filter_completed').attr('checked', false).change(); }
  });

  guiders.createGuider({
    title: "Backlog tab",
    description: "All your user stories are always accessible using this backlog tab.",
    id: "backlog.tab",
    next: 'stats.tab',
    attachTo: "#tab-sprint-Backlog",
    position: 3
  });

  guiders.createGuider({
    buttons: [],
    title: "Stats tab",
    description: "As your project progresses and you start completing sprints, statistics and graphs relating to the progress of your project will be shown to you in this tab.<br><br>" +
      "<b>Click on the Stats tab now to continue</b>",
    id: "stats.tab",
    next: 'stats.loading',
    attachTo: "#tab-sprint-Stats",
    position: 3,
    onShow: function() { $('#tab-sprint-Stats').bind('click.guiders', function() { nextFn(); }); },
    onHide: function() { unbind(); }
  });

  guiders.createGuider({
    buttons: [],
    title: "Loading stats",
    description: "Please wait while the backlog statistics load...",
    id: 'stats.loading',
    next: 'stats.burn-down',
    attachTo: '#tab-sprint-Stats',
    position: 3,
    overlay: true,
    onShow: function() { $('#stats-container').live('renderingCharts', function() { _.delay(function() { setupStatsGuiders(); nextFn(); }, 500); }); },
    onHide: function() { $('#stats-container').die('renderingCharts'); }
  });

  // we cannot set up stats guiders until the elements exist
  function setupStatsGuiders() {
    guiders.createGuider({
      title: "Burn down",
      description: "The burn down chart illustrates your actual progress versus your project progress along with a projected (green) line demonstrating when you are likely to complete at your current run rate.",
      id: 'stats.burn-down',
      next: 'stats.burn-up',
      attachTo: '#burn-down-chart',
      position: 3,
      offset: { left: -30, top: 0 }
    });

    guiders.createGuider({
      title: "Burn up",
      description: "The burn up chart shows you how many points in total you have in your backlog at the start and end of each sprint using blue, and shows you your progress in completing stories and their points for each sprint.",
      id: 'stats.burn-up',
      next: 'stats.completed-sprints',
      attachTo: '#burn-up-chart',
      position: 9,
    });

    guiders.createGuider({
      title: "Completed sprints",
      description: "The completed sprints chart shows you your velocity (completed points) for each completed sprint",
      id: 'stats.completed-sprints',
      next: 'sprints.tabs',
      attachTo: '#velocity-chart',
      position: 3,
      offset: { left: -30, top: 0 },
    });

    guiders.createGuider({
      buttons: [],
      title: "Sprint tabs",
      description: "For each sprint, a tab is added above in numerical order, with 1 being the first sprint.<br><br>" +
        "<b>Click on the Sprint 3 tab above to continue.</b>",
      id: 'sprints.tabs',
      next: 'sprint.3.overview',
      attachTo: 'ul.infinite-tabs li.sprint-tab:contains(3)',
      position: 6,
      onShow: function() { $('ul.infinite-tabs li.sprint-tab:contains(3) a').bind('click.guiders', function() { _.delay(function() { setupSprint3Guiders(); nextFn(); }, 50); }); },
      onHide: function() { unbind(); }
    });
  }

  function setupSprint3Guiders() {
    guiders.createGuider({
      title: "Completed sprint",
      description: "As you can see, Sprint 3 is marked as completed indicated by the tick and the green background of the header.<br><br>" +
        "All stories listed on the left are Done.  Before a sprint can be marked as complete, all stories must first be marked as Done.",
      id: 'sprint.3.overview',
      next: 'sprints.3.totals',
      overlay: true,
      offset: { left: -100, top: -10 }
    });

    guiders.createGuider({
      title: "Sprint totals",
      description: "As you add and remove stories to your sprint, the sprint totals above will be updated.  This is useful in ensuring you don't overallocate stories to a sprint.",
      id: 'sprints.3.totals',
      next: 'sprints.5',
      attachTo: '#backlog-data-area .backlog-stats',
      position: 6,
      offset: { left: 0, top: -10 }
    });

    guiders.createGuider({
      buttons: [],
      title: "Incomplete sprints",
      description: "Sprint 5 is not yet complete and as such stories can added or removed from this sprint.<br><br>" +
        "<b>Click on the Sprint 5 tab to continue</b>",
      id: 'sprints.5',
      next: 'sprints.5.overview',
      attachTo: 'ul.infinite-tabs li.sprint-tab:contains(5)',
      position: 6,
      width: 260,
      onShow: function() { $('ul.infinite-tabs li.sprint-tab:contains(5)').bind('click.guiders', function() { _.delay(function() { setupSprint5Guiders(); nextFn(); }, 50); }); },
      onHide: function() { unbind(); }
    });
  }

  function setupSprint5Guiders() {
    guiders.createGuider({
      title: "Current sprint",
      description: "As you can see on the left, Sprint 5 has a number of stories assigned to it which are in progress and not all marked as Done.  As progress on each story is made, the status can be updated from this area.",
      id: 'sprints.5.overview',
      next: 'sprints.5.unassigned-stories',
      overlay: true,
      offset: { left: 100, top: 0 }
    });

    guiders.createGuider({
      title: "Unassigned backlog stories",
      description: "Stories from the backlog that are not yet assigned to a sprint are listed on the right.<br><br>You can click on or drag a story to the left to assign it to the current sprint.",
      id: 'sprints.5.unassigned-stories',
      next: 'sprints.5.story',
      attachTo: '#sprints-container .unassigned-stories-container .story-card:first',
      position: 9
    });

    guiders.createGuider({
      title: "Stories assigned to a sprint",
      description: "The story below has been assigned to the current sprint.  You can unassign this story from this sprint by simply clicking on the story or dragging it to the right.",
      id: 'sprints.5.story',
      next: 'sprints.5.story-status',
      attachTo: '#sprints-container .stories-container .story-card:last',
      position: 12,
      offset: { top: 15, left: 0 }
    });

    guiders.createGuider({
      title: "Story status",
      description: "You can change the status of any story assigned to a sprint by simply clicking on the status tab and updating the status.<br><br>" +
        "<b>Click on the status '" + $('#sprints-container .stories-container .story-card:last .status .tab').text() + "' to change it now.</b>",
      id: 'sprints.5.story-status',
      next: 'sprints.5.finished',
      attachTo: '#sprints-container .stories-container .story-card:last .status .tab',
      position: 3,
      onShow: function() {
        var selector = '#sprints-container .stories-container .story-card:last .status .tab';
        $(selector).bind('click.guiders', function() {
          unbind();
          var statusUpdated = function() {
            unbind();
            $('#sprint-story-status-dropdown li').die('statusChanged');
            nextFn();
          }
          $(selector).bind('click.guiders', statusUpdated);
          $('#sprint-story-status-dropdown li').live('statusChanged', statusUpdated);
        })
      },
      onHide: function() {
        unbind();
        $('#sprint-story-status-dropdown li').die('click');
      }
    });

    guiders.createGuider({
      buttons: [],
      title: "Back to backlog",
      description: "<b>Now click on the Backlog tab to return to the main backlog view of all stories.</b>",
      id: 'sprints.5.finished',
      next: 'sprints.backlog.snapshots',
      attachTo: '#tab-sprint-Backlog',
      position: 3,
      onShow: function() { $('#tab-sprint-Backlog').bind('click.guiders', nextFn); },
      onHide: function() { unbind(); }
    });
  }

  guiders.createGuider({
    title: "Snapshots",
    description: "Snapshots are one of the killer features of easyBacklog that will help you to manage and report on change throughout your project.  This is especially useful when you are working with fixed resources or a fixed budget.<br><br>" +
      "Snapshots of the entire backlog are automatically taken at the start of each sprint, but snapshots can also be manually created at any point in time.  An example of when a snapshot may be manually created could be following a meeting where a project scope has been agreed with a client based on the backlog.<br><br>" +
      "To view a snapshot you simply roll over the snapshots menu in the top right, and select the snapshot you wish to view from the drop down.<br><br>" +
      "We will now show you how to compare a snapshot with the current version.",
    id: "sprints.backlog.snapshots",
    next: "sprints.backlog.snapshots.rollover",
    overlay: true,
    width: 500
  });

  guiders.createGuider({
    title: "Compare snapshots",
    description: "<b>Roll over the Snapshots menu item and click 'Compare snapshots'</b>",
    id: "sprints.backlog.snapshots.rollover",
    next: "sprints.backlog.snapshots.compare",
    attachTo: '#backlog-data-area #snapshot-menu',
    position: 6,
    onShow: function() { $('#backlog-data-area #snapshot-menu').bind('mouseover.guiders', function() { _.delay(function() { setupSnapshotCompare(); nextFn(); }, 50); }); },
    onHide: function() { unbind(); }
  });

  function setupSnapshotCompare() {
    guiders.createGuider({
      title: "Compare snapshots",
      description: "<b>Roll over the Snapshots menu item and click 'Compare snapshots'</b>",
      id: "sprints.backlog.snapshots.compare",
      next: "sprints.backlog.snapshots.compare.dialog",
      attachTo: '.snapshot-menu-container a#compare-snapshot',
      position: 6,
      onShow: function() { $('.snapshot-menu-container a#compare-snapshot').bind('click.guiders', function() { _.delay(function() { setupSnapshotCompareDialog(); nextFn(); }, 50); }); },
      onHide: function() { unbind(); }
    });
  }

  function setupSnapshotCompareDialog() {
    guiders.createGuider({
      title: "Compare snapshots",
      description: "When comparing a snapshot you typically chose the older version as the base version for your report.<br><br><b>Select Sprint 1 from the drop down</b>",
      id: "sprints.backlog.snapshots.compare.dialog",
      next: "sprints.backlog.compare.dialog.view",
      attachTo: '#dialog-compare-snapshot select#base-snapshot',
      position: 3,
      width: 270,
      onShow: function() { $('#dialog-compare-snapshot select#base-snapshot').bind('change.guiders', nextFn); },
      onHide: function() { unbind(); }
    });

    guiders.createGuider({
      title: "Compare snapshots",
      description: "<b>Before you press 'Compare', please note that a new browser Tab or Window will open with the snapshot comparison report.  <span style='color: red'>Once you have finished viewing the report, please close the Tab or Window to return to this walk through.</span><br><br>Now click 'Compare'</b>",
      id: "sprints.backlog.compare.dialog.view",
      next: "sprints.backlog.summary",
      attachTo: '#dialog-compare-snapshot+.ui-dialog-buttonpane button:first',
      position: 9,
      width: 270,
      onShow: function() {
        $('#dialog-compare-snapshot+.ui-dialog-buttonpane button:first, #dialog-compare-snapshot+.ui-dialog-buttonpane button:last').bind('click.guiders', nextFn);
      },
      onHide: function() { unbind(); }
    });
  }

  guiders.createGuider({
    buttons: [{name: "Close"}],
    title: "easyBacklog walk through complete",
    description: "We hope you found this walk through useful.<br><br>" +
      "Please remember that you have a plethora of settings for your backlog in the <b>'Settings'</b> menu item in the top right that will allow you to configure your backlog as it suits you.<br><br>" +
      "We welcome any questions or suggestions, so please do get in touch by following the <b>'Support'</b> menu item at the top of the page, or the <b>'Feedback'</b> button in the bottom right.",
    id: "sprints.backlog.summary",
    overlay: true,
    width: 500
  });

  guiders.show('first');
});