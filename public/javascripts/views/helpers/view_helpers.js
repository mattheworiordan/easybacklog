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
  }
}