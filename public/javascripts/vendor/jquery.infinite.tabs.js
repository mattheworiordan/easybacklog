(function($) {
  /*
   * Infinite Tabs
   * Repository: https://github.com/mattheworiordan/jquery.infinite.tabs
   * Author: http://mattheworiordan.com
   * Rounded tabs inspired by http://css-tricks.com/14001-tabs-with-round-out-borders/
   *
   * options are:
   * - initialTabSlideOffset: amount tabs are offset by when slid under a locked tab
   *
   * commands are:
   * - check-for-resize: useful when a tab has been added directly via the DOM
   *
   * Command usage example:
   *   $('ul#tabs').infiniteTabs('check-for-resize');
   */

  var opts;

  $.fn.infiniteTabs = function(command, options) {
    if ( (typeof command === 'object') || !command ) {
      // build main options before element iteration
      opts = $.extend({}, $.fn.infiniteTabs.defaults, command);

      // iterate and initialize matched element
      return this.each(initialize);
    }

    if (typeof command === 'string') {
      switch (command.toLowerCase()) {
        case 'check-for-resize':
          return this.each(checkForResize);
      }
    }
  }

  function initialize() {
    var scroller = $('<li class="scroller"><div><ul></ul></div></li>'),
        scrollableTabs = $(this).find('li:not(.locked)'),
        that = this,
        scrollableTabOffset = 0,
        windowWidth = $(window).width(),
        scrollerWidth,
        nav;

    // move non-fixed tabs into the scroller ul
    moveNonFixedTabsToScroller(this, scrollableTabs, scroller);
    scrollerWidth = $(this).innerWidth() - scroller.position().left;

    // add navigation for tabs to DOM regardless of whether we need it
    nav = addNav(this);
    positionNav(this, nav, scroller, scrollerWidth);

    $(nav).find('a.previous-tab').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      scrollableTabOffset = shiftTabOffset(-1, scrollableTabOffset, scroller, nav, opts);
      shiftScroller(scrollableTabOffset, scroller, that);
    });
    $(nav).find('a.next-tab').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      scrollableTabOffset = shiftTabOffset(1, scrollableTabOffset, scroller, nav, opts);
      shiftScroller(scrollableTabOffset, scroller, that);
    });

    // set scroller width with buffer to ensure resize event picks up resize before CSS wraps
    scroller.find('div').css('width', (scrollerWidth-20) + 'px');

    // reference to this method in context is needed for the check-for-resize command
    var positionNavFunction = function() {
      positionNav(that, nav, scroller, scrollerWidth);
    }
    // add reference to the ul.infinite-tabs DOM element so it can be called by the plugin command
    $(this).data('positionNavFunction', positionNavFunction);

    // resize scroller area when window resizes
    $(window).resize(function(e) {
      var resizeWidthBy = $(window).width() - windowWidth;
      if (resizeWidthBy) {
        scrollerWidth += resizeWidthBy;
        windowWidth = $(window).width();
        scroller.find('div').css('width', (scrollerWidth-20) + 'px');
        positionNavFunction();
      }
    });

    // ensure tab is completely visible when clicked on if in scroller area
    $(this).find('li.scroller li').click(function(e) {
      var scrollerList = scroller.find('ul'),
          tabRightEdge;
      // tab clicked on is under locked tabs on the left
      if (-scrollableTabOffset > $(this).position().left) {
        scrollableTabOffset = -$(this).position().left + ($(this).is(':first-child') ? 0 : opts.initialTabSlideOffset);
        scrollerList.css('left', scrollableTabOffset + 'px');
      } else {
        if ($(nav).is(':visible')) {
          tabRightEdge = $(this).offset().left + $(this).outerWidth();
          if (tabRightEdge > $(nav).offset().left) {
            scrollableTabOffset -= tabRightEdge - $(nav).offset().left + opts.initialTabSlideOffset;
            scrollerList.css('left', scrollableTabOffset + 'px');
          }
        }
      }
    });

    // the scroller li is not clickable
    $(this).find('li.scroller').click(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    })
  }

  /* determine currently left most completely visible tab */
  function getLeftMostTabIndex(scroller, scrollableTabOffset) {
    var tabIndex = 0;
    var tabFound = false;
    scroller.find('ul li').each(function (index, elem) {
      if (!tabFound) {
        if ($(elem).position().left >= -scrollableTabOffset) {
          tabFound = true;
        } else {
          tabIndex++;
        }
      }
    });
    return tabIndex;
  }

  function totalElemWidth(elems) {
    var width = 0;
    elems.each(function (index, elem) {
      width += $(elem).outerWidth();
    });
    return width;
  }

  function addNav(outerMostList) {
    // add the navigation arrows because too many tabs to display in space we have
    var backArrow = ($.browser.msie && $.browser.version <= 8) ? '&lt;' : '&#x25C0;';
    var forwardArrow = ($.browser.msie && $.browser.version <= 8) ? '&gt;' : '&#x25B6;';
    var nav = $('<li class="navigation"><div><a href="#next" class="next-tab">' + backArrow + '</a><a href="#previous" class="previous-tab">' + forwardArrow + '</a></div></li>');
    $(outerMostList).append(nav);
    var navHeightDiff = $(outerMostList).outerHeight() - nav.outerHeight();
    var navPadTop = Math.round(navHeightDiff / 2);
    $(nav).find('a').css('padding-top', navPadTop + 'px').css('padding-bottom', (navHeightDiff - navPadTop) + 'px');
    return nav;
  }

  function positionNav(outerMostList, nav, scroller, scrollerWidth) {
    if ($(nav).data('scrollerWidth')) {
      // shift relative to change of size of scrollerWidth
      var currentPos = parseInt(nav.css('left').replace(/px/, ''));
      currentPos += scrollerWidth - parseInt($(nav).data('scrollerWidth'));
      nav.css('left', currentPos + 'px');
    } else {
      // first time this element is positioned, use list size to determine it's position flush to the right
      var navPosition = ($(outerMostList).width() - $(nav).width() + 10);
      nav.css('left', navPosition + 'px');
    }
    $(nav).data('scrollerWidth', scrollerWidth); // store current scrollerWidth so we can move nav relative to resize in scrollerWidth
    // if tabs are greater than the greatest possible scroller width then add navigation
    if (totalElemWidth(scroller.find('li')) > scrollerWidth - 20) {
      nav.css('display', 'block');
    } else {
      nav.css('display', 'none');
    }
  }

  function moveNonFixedTabsToScroller(containerList, scrollableTabs, scroller) {
    scrollableTabs.each(function(index, elem) { scroller.find('ul').append(elem); });
    if ($(containerList).find('li.locked').length % 2 === 1) {
      // add a hidden li so that odd/even matching works on scroller list
      scroller.find('ul').prepend($('<li class="hidden"></li>'));
    }
    $(containerList).append(scroller);
    // if there are no pinned tabs, then set a special CSS class so that the tab curve is valid
    if ($(containerList).find('>li:not(.scroller):not(.nav)').length == 0) {
      scroller.find('ul li:first').addClass('absolute-first');
    }
  }

  function shiftTabOffset(direction, currentScrollableTabOffset, scroller, nav, opts) {
    var currentTabIndex = getLeftMostTabIndex(scroller, currentScrollableTabOffset);
    var scrollerList = scroller.find('ul');

    if (direction < 0) { // move tabs left
      if (currentScrollableTabOffset === 0) {
        // if not yet scrolled, scroll most of a tab left but leave opts.initialTabSlideOffset pixels to show tab has slid under
        currentScrollableTabOffset -= scrollerList.find('li:first').outerWidth() - opts.initialTabSlideOffset;
      } else {
        // shift width of the left most tab
        currentScrollableTabOffset -= scrollerList.find('li:nth-child(' + (currentTabIndex+1) + ')').outerWidth();
      }
      var scrollMax = -scroller.find('li:last').position().left + nav.position().left - scroller.position().left - nav.innerWidth() + 8 - opts.initialTabSlideOffset; // 8 shadow
      if (currentScrollableTabOffset < scrollMax) {
        // never scroll beyond the last tab
        currentScrollableTabOffset = scrollMax;
      }
    } else { // move tabs right
      currentScrollableTabOffset += scrollerList.find('li:nth-child(' + (currentTabIndex) + ')').outerWidth();
      if (currentScrollableTabOffset >= 0) {
        currentScrollableTabOffset = 0;
      }
    }

    return currentScrollableTabOffset;
  }

  function shiftScroller(scrollableTabOffset, scroller, outerMostList) {
    var scrollerList = scroller.find('ul');
    scrollerList.css('left', scrollableTabOffset + 'px');
    if (scrollableTabOffset < 0) {
      $(outerMostList).find('li.locked').filter(':last').addClass('overlay'); // show the shadow on first locked tab indicating tabs have slid under
    } else {
      $(outerMostList).find('li.locked').filter(':last').removeClass('overlay'); // remove the shadow on first locked tab indicating tabs have slid under
    }
  }

  function checkForResize() {
    if ($(this).is('ul.infinite-tabs')) {
      $(this).data('positionNavFunction')();
    }
  }

  //
  // plugin defaults
  //
  $.fn.infiniteTabs.defaults = {
    initialTabSlideOffset: 10
  };
})(jQuery);