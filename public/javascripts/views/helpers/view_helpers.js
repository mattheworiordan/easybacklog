App.Views.Helpers = {
  /*
   * Generic view helpers
   */

  // ensure element is in view port (use only for Backlog view), slide in nicely
  scrollIntoBacklogView: function(elem, callback) {
    // be forgiving, just don't scroll into view if element does not exist
    if ($(elem).length) {
      var scrollAmount = $(window).scrollTop(),
          currentPosition = $(elem).offset().top,
          bufferBottom = 100,
          bufferTop = this.bufferTop ? this.bufferTop : this.bufferTop = $('#backlog-container').offset().top,
          newScrollPosition = false;

      if (currentPosition < scrollAmount + bufferTop) {
        newScrollPosition = currentPosition - bufferTop;
      } else if (currentPosition > scrollAmount + $(window).height() - bufferBottom) {
        newScrollPosition = currentPosition - $(window).height() + bufferBottom;
      }

      if (newScrollPosition) {
        $("html:not(:animated),body:not(:animated)").animate({
          scrollTop: newScrollPosition
        }, 'fast', null, function() {
          if (_.isFunction(callback)) {
            callback(elem);
          }
        });
      } else {
        if (_.isFunction(callback)) {
          callback(elem);
        }
      }
    } else {
      if (_.isFunction(callback)) {
        callback(elem);
      }
    }
  },

  /*
   * Methods that are shared between Sprint view and Stories view
   */

  // because we change the DOM whilst the mouse is over the element
  // the :hover does not work corretly, we need to use JQuery hover instead and manually deal with exceptions
  setStatusHover: function() {
    $(this.el).find('.status .tab').hover(
      function() { $(this).addClass('hover'); },
      function() { $(this).removeClass('hover'); }
    );
  },

  statusChangeClick: function(event) {
    var that = this,
        dropDown = $(JST['stories/status-drop-down']({ model: this.model }));

    event.preventDefault();
    event.stopPropagation();

    if (this.model.SprintStory().Sprint().isComplete()) {
      new App.Views.Warning({ message: 'You cannot change the status of this story as it\'s assigned to a completed sprint'});
    } else {
      $('body').find('#sprint-story-status-dropdown').remove();
      $('body').append(dropDown);

      // manually add hover state as had problems with CSS hover when elems moved away from the cursor
      dropDown.find('li').hover(function() {
        $(this).addClass('hover');
      }, function() {
        $(this).removeClass('hover');
      });

      // make tabs similar width so they don't look odd when smaller than the selected tab
      if (dropDown.width() < $(this.el).find('.status .tab').outerWidth()) {
        dropDown.css('width', $(this.el).find('.status .tab').outerWidth() + 'px')
      }

      dropDown.css('position','absolute').position({
        of: $(this.el).find('.status .tab'),
        my: 'center top',
        at: 'center bottom',
        offset: "0 0"
      });

      $('html').bind('click.status-drop-down', function() {
        $('body').find('#sprint-story-status-dropdown').remove();
        $('html').unbind('click.status-drop-down');
      });

      dropDown.find('li').click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(event.target).trigger('statusChanged'); // custom event for backlog_walkthrough

        var id = $(this).attr('id').replace('status-id-',''),
            code = $(this).attr('class').match(/status-code-(\w+)/)[1],
            name = $(this).text();

        $('body').find('#sprint-story-status-dropdown').remove();
        $('html').unbind('click.status-drop-down');

        App.Views.Helpers.statusDropDownChanged.call(that, id, code, name);
      });
    }
  },

  statusDropDownChanged: function(id, code, name) {
    var that = this;

    // update the status tab
    $(this.el).find('.status .tab').attr('class', 'tab status-code-' + code).removeClass('hover').find('span').text(name);
    // now update whether the story is locked for moving or not
    if (code === this.model.SprintStory().Status().DoneCode) {
      $(this.el).addClass('locked');
    } else {
      $(this.el).removeClass('locked');
    }

    this.model.SprintStory().set({ sprint_story_status_id: Number(id) });
    this.model.SprintStory().save(false, {
      success: function(model) {
        // Store updated statistics in sprint model
        // If parentView exists, let it handle updating the view
        that.model.SprintStory().Sprint().set(model.get('sprint_statistics'));
        if (that.parentView) {
          that.parentView.updateStatistics(model.get('sprint_statistics'));
        }
      },
      error: function(model, response) {
        var errorMessage = 'we\'ve got a problem on our side';
        try {
          errorMessage = $.parseJSON(response.responseText).message;
        } catch (e) { if (window.console) { console.log(e); } }
        var errorView = new App.Views.Error({ message: 'Oops, ' + errorMessage + '.  Please refresh your browser' });
      }
    });
  },

  // links that have been converted to <a href> will be shown as links with a roll over to visit the link
  // this is common functionality shared across views
  activateUrlify: function(target) {
    var that = this;
    $(target).find('a.urlified').live('mouseover', function(event) {
      // new roll over so clear any old helper and any clear events
      if (that.linkHelper) { that.linkHelper.remove(); }
      if (that.linkRolloutTimeout) { clearTimeout(that.linkRolloutTimeout); }

      var originalHref = $('<div>').html($(this).attr('href')).text(),
          href = originalHref;
      if (href.match(/^[-;&=\+\$,\w]+@/)) {
        href = 'mailto:' + href;
      }
      if (href.match(/^www\./)) {
        href = 'http://' + href;
      }
      var anchor = $('<a>').attr('href', href).text(originalHref);
      if (!href.match(/^mailto:/i)) {
         anchor.attr('target','_blank');
      }

      that.linkHelper = $('<div class="link-helper">').text('Go to link: ').append(anchor);
      $('body').append(that.linkHelper);
      that.linkHelper.position({
        of: $(this),
        my: 'right top',
        at: 'right bottom',
        offset: "0 0"
      });
      $(that.linkHelper).children().andSelf().mouseover(function() {
        if (that.linkRolloutTimeout) {
          clearTimeout(that.linkRolloutTimeout);
          that.linkRolloutTimeout = false;
        }
      }).mouseout(function() {
        if (that.linkRolloutTimeout) {
          clearTimeout(that.linkRolloutTimeout);
        }
        that.linkRolloutTimeout = setTimeout(function() {
          that.linkHelper.remove();
        }, 100);
      });
    }).live('mouseout', function(event) {
      that.linkRolloutTimeout = setTimeout(function() {
        that.linkHelper.remove();
      }, 150);
    }).live('click', function(event) {
      event.preventDefault();
      if (that.linkRolloutTimeout) { clearTimeout(that.linkRolloutTimeout); }
      if (that.linkHelper) { that.linkHelper.remove(); }
    });
  },

  addUseOptions: function(target, options) {
    return _(target).extend({
      use5090Estimates: options.use5090Estimates,
      useCostEstimates: options.useCostEstimates,
      useDaysEstimates: options.useDaysEstimates
    });
  },

  setStoryColor: function(target, color) {
    var colorWithoutHex = (color.match(/^#/) ? color.substring(1) : color);
    var colorWithHex = '#' + colorWithoutHex;
    if (colorWithoutHex.toLowerCase() === 'ffffff') {
      colorWithoutHex = colorWithHex = '';
      $(target).css('background-color','transparent');
    } else {
      var colors = colorWithoutHex.match(/[\d\w]{2}/g);
      $(target).css('background-color', 'rgba(' + parseInt(colors[0],16) + ', ' + parseInt(colors[1],16) + ', ' + parseInt(colors[2],16) + ', 0.15)');
    }
    $(target).find('.background-color-indicator').css('background-color', colorWithHex);
    if ($(target).is('.story-card')) {
      $(target).css('border-color', colorWithHex);
    }
    return colorWithoutHex;
  }
}