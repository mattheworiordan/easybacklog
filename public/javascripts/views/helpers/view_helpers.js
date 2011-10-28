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

  statusChangeClick: function() {
    var dropDownOptions = App.Collections.SprintStoryStatuses.sortBy(function(s) { return s.get('position'); }).map(function(status) {
      return ('<option value="' + status.get('id') + '">' + htmlEncode(status.get('status')) + '</option>');
    }).join(''),
        dropDownNode = $(this.el).find('.status .drop-down'),
        className = $(this.el).find('.status .tab').attr('class').match(/(status-code-\w+)/)[1];

    $(this.el).find('.status .tab').hide();
    dropDownNode.find('select').empty().append($(dropDownOptions)).attr('class', className);
    dropDownNode.find('select option[value=' + this.model.SprintStory().get('sprint_story_status_id') + ']').attr("selected", "selected");
    dropDownNode.show().focus();
  },

  statusDropDownChanged: function() {
    var selected = $(this.el).find('.status .drop-down select option:selected'),
        code = App.Collections.SprintStoryStatuses.get(selected.val()).get('code'),
        that = this;

    $(this.el).find('.status .tab').attr('class', 'tab status-code-' + code).find('span').text(selected.text());
    this.model.SprintStory().set({ sprint_story_status_id: selected.val() });
    this.model.SprintStory().save(false, {
      success: function(model) {
        // update the stats as completed count may change
        // If parentView exists, let it handle this,
        // else update the sprint model as no realtime update is needed
        if (that.parentView) {
          that.parentView.updateStatistics(model.get('sprint_statistics'));
        } else {
          that.model.SprintStory().Sprint().set(model.get('sprint_statistics'));
        }
      },
      error: function(model, response) {
        var errorMessage = 'we\'ve got a problem on our side';
        try {
          errorMessage = $.parseJSON(response.responseText).message;
        } catch (e) { if (window.console) { console.log(e); } }
        var errorView = new App.Views.Error({ message: 'Oops, ' + errorMessage + '.  Please refresh your browser' });
      }
    })
    this.statusDropDownLostFocus();
  },

  statusDropDownLostFocus: function() {
    $(this.el).find('.status .tab').show();
    $(this.el).find('.status .drop-down').hide();
  }
}