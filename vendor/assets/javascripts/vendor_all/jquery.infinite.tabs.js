/*global window:false, setTimeout:false, jQuery:false */ // JSLint
/*jslint unparam: true, white: true, maxerr: 50, indent: 2 */

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
 * - adjust-to-fit: useful when a tab has been added directly via the DOM or container has been resized
 * - add-tab: pass in complete li element to be added to the scroller tabs
 * - remove-tab: pass in li element to be removed
 * - set-tab-content: set the inner content of a scrolling tab only using html text or jQuery DOM, but also adjust the position of elements post DOM change
 *
 * Command usage example:
 *   $('ul#tabs').infiniteTabs( 'adjust-to-fit' );
 *   $('ul#tabs').infiniteTabs( 'append-tab', $('<li><a>new tab at end</a></li>') );
 *   $('ul#tabs').infiniteTabs( 'prepend-tab', $('<li><a>new tab at start</a></li>') );
 *   $('ul#tabs').infiniteTabs( 'remove-tab', $('ul#tabs li.scroller li:not(.navigation):last') );
 *   $('ul#tabs').infiniteTabs( 'set-tab-content', $(tab), $('<span class="content-icon">Content</span>') );
 *   $('ul#tabs').infiniteTabs( 'set-tab-content', $(tab), 'new tab title' );
 */

(function ($) {
  "use strict";

  var opts, initialize, adjustToFit, addTab, removeTab, setTabContent,
      moveNonFixedTabsToScroller, addNav, positionNav, getLeftMostTabIndex,
      totalElemWidth, shiftTabOffset, shiftScroller, slideTabsAfterResize;

  $.fn.infiniteTabs = function(command, options, secondParam) {
    if ( (typeof command === 'object') || !command ) {
      // build main options before element iteration
      opts = $.extend({}, $.fn.infiniteTabs.defaults, command);

      // iterate and initialize matched element
      return this.each(initialize);
    }

    if (typeof command === 'string') {
      switch (command.toLowerCase()) {
        case 'adjust-to-fit':
          return this.each(adjustToFit);
        case 'append-tab':
          return this.each(function(index, elem) {
            addTab.call(elem, options, 'append');
          });
        case 'prepend-tab':
          return this.each(function(index, elem) {
            addTab.call(elem, options, 'prepend');
          });
        case 'remove-tab':
          return this.each(function(index, elem) {
            removeTab.call(elem, options);
          });
        case 'set-tab-content':
          return this.each(function(index, elem) {
            setTabContent.call(elem, options, secondParam);
          });
      }
    }
  };

  initialize = function () {
    var scroller = $('<li class="scroller"><div><ul></ul></div></li>'),
        scrollableTabs = $(this).find('li:not(.locked)'),
        that = this,
        scrollableTabOffset = 0,
        windowWidth = $(window).width(),
        scrollerWidth,
        nav,
        lastPinnedTab,
        ensurePinnedTabCornersAreCorrect,
        positionNavFunction,
        setScrollerWidth;

    // move non-fixed tabs into the scroller ul
    moveNonFixedTabsToScroller(this, scrollableTabs, scroller);

    setScrollerWidth = function(that) {
      lastPinnedTab = $(that).find('>li:not(.navigation):not(.scroller):last');
      if (lastPinnedTab.length === 0) {
        scrollerWidth = $(that).innerWidth();
      } else {
        scrollerWidth = $(that).innerWidth() - lastPinnedTab.offset().left - lastPinnedTab.width();
      }
    };

    setScrollerWidth(this);

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

    // if we have no scrollable tabs, the far right pinned tab needs to be set as absolute last
    //   so that the colour of the curve is correct, normally it assumes there is a tab on the right
    ensurePinnedTabCornersAreCorrect = function() {
      if (scroller.find('li:not(.hidden)').length === 0) {
        $(that).find('>li:not(.navigation):not(.scroller):last').addClass('absolute-last');
      } else {
        $(that).find('>li:not(.navigation):not(.scroller):last').removeClass('absolute-last');
      }
    };
    ensurePinnedTabCornersAreCorrect();

    // reference to this method in context is needed for the adjust-to-fit command
    positionNavFunction = function() {
      positionNav(that, nav, scroller, scrollerWidth);
      ensurePinnedTabCornersAreCorrect();
    };

    // add reference to the ul.infinite-tabs DOM element so it can be called by the plugin command
    $(this).data('positionNavFunction', positionNavFunction);

    // allow external influences to effect private scrollerWidth
    $(this).data('resetScrollerWidth', function() {
      setScrollerWidth(that);
      scroller.find('div').css('width', (scrollerWidth-20) + 'px');
    });

    // resize scroller area when window resizes
    $(window).resize(function(e) {
      var resizeWidthBy = $(window).width() - windowWidth,
          moveTabsBackBy;
      if (resizeWidthBy) {
        scrollerWidth += resizeWidthBy;
        windowWidth = $(window).width();
        scroller.find('div').css('width', (scrollerWidth-20) + 'px');
        positionNavFunction();
        moveTabsBackBy = slideTabsAfterResize(scrollableTabOffset, scrollerWidth, scroller);
        if (moveTabsBackBy) {
          scrollableTabOffset += moveTabsBackBy;
          if (scrollableTabOffset > 0) { scrollableTabOffset = 0; }
          shiftScroller(scrollableTabOffset, scroller, that);
        }
      }
    });

    // ensure tab is completely visible when clicked on if in scroller area
    // must wait until execution has completed in case DOM has been updated
    $(this).find('li.scroller li').click(function(e) {
      var that = this;
      setTimeout(function() {
        var scrollerList = scroller.find('ul'),
            tabRightEdge;
        // tab clicked on is under locked tabs on the left
        if (-scrollableTabOffset > $(that).position().left) {
          scrollableTabOffset = -$(that).position().left + ($(that).is(':first-child') ? 0 : opts.initialTabSlideOffset);
          scrollerList.css('left', scrollableTabOffset + 'px');
        } else {
          if ($(nav).is(':visible')) {
            tabRightEdge = $(that).offset().left + $(that).outerWidth();
            if (tabRightEdge > $(nav).offset().left) {
              scrollableTabOffset -= tabRightEdge - $(nav).offset().left + opts.initialTabSlideOffset;
              scrollerList.css('left', scrollableTabOffset + 'px');
            }
          }
        }
      }, 1);
    });

    // the scroller li is not clickable
    $(this).find('li.scroller').click(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    });
  };

  /* determine currently left most completely visible tab */
  getLeftMostTabIndex = function(scroller, scrollableTabOffset) {
    var tabIndex = 0,
        tabFound = false;
    scroller.find('ul li').each(function (index, elem) {
      if (!tabFound) {
        if ($(elem).position().left >= -scrollableTabOffset) {
          tabFound = true;
        } else {
          tabIndex += 1;
        }
      }
    });
    return tabIndex;
  };

  totalElemWidth = function(elems) {
    var width = 0;
    elems.each(function (index, elem) {
      width += $(elem).outerWidth();
    });
    return width;
  };

  addNav = function(outerMostList) {
    // add the navigation arrows because too many tabs to display in space we have
    var backArrow = ($.browser.msie && $.browser.version <= 8) ? '&lt;' : '&#x25C0;',
        forwardArrow = ($.browser.msie && $.browser.version <= 8) ? '&gt;' : '&#x25B6;',
        nav = $('<li class="navigation"><div><a href="#next" class="next-tab">' + backArrow + '</a><a href="#previous" class="previous-tab">' + forwardArrow + '</a></div></li>'),
        navHeightDiff,
        navPadTop;

    $(outerMostList).append(nav);
    navHeightDiff = $(outerMostList).outerHeight() - nav.outerHeight();
    navPadTop = Math.round(navHeightDiff / 2);
    $(nav).find('a').css('padding-top', navPadTop + 'px').css('padding-bottom', (navHeightDiff - navPadTop) + 'px');
    return nav;
  };

  // position the tab navigation relative to the scrolling tab area (on the right)
  positionNav = function(outerMostList, nav, scroller, scrollerWidth) {
    var currentPos, navPosition;

    if ($(nav).data('scrollerWidth')) {
      // shift relative to change of size of scrollerWidth
      currentPos = parseInt(nav.css('left').replace(/px/, ''), 10);
      currentPos += scrollerWidth - parseInt($(nav).data('scrollerWidth'), 10);
      nav.css('left', currentPos + 'px');
    } else {
      // first time this element is positioned, use list size to determine it's position flush to the right
      navPosition = ($(outerMostList).width() - $(nav).width() + 10);
      nav.css('left', navPosition + 'px');
    }
    $(nav).data('scrollerWidth', scrollerWidth); // store current scrollerWidth so we can move nav relative to resize in scrollerWidth
    // if tabs are greater than the greatest possible scroller width then add navigation
    if (totalElemWidth(scroller.find('li')) > scrollerWidth - 20) {
      nav.css('display', 'block');
    } else {
      nav.css('display', 'none');
    }
  };

  // if the tabs are offset to the left, and the user resizes the window wider,
  // it can result in tabs being scrolled out of view yet the navigation disappears as there is enough
  // space for all tabs.
  // therefore after a scroll event, shift the tabs up to the right of the scroll area
  slideTabsAfterResize = function(scrollableTabOffset, scrollerWidth, scroller) {
    if (scrollableTabOffset < 0) { // tabs are offset / scrolled to the left (under pinned tabs)
      if (scrollableTabOffset + totalElemWidth(scroller.find('li')) + 50 < scrollerWidth) {
        // shift scroll bar forwards by this amount
        return -(scrollableTabOffset + totalElemWidth(scroller.find('li')) + 50 - scrollerWidth);
      }
    }
    return false;
  };

  moveNonFixedTabsToScroller = function(containerList, scrollableTabs, scroller) {
    scrollableTabs.each(function(index, elem) { scroller.find('ul').append(elem); });
    if ($(containerList).find('li.locked').length % 2 === 1) {
      // add a hidden li so that odd/even matching works on scroller list
      scroller.find('ul').prepend($('<li class="hidden"></li>'));
    }
    $(containerList).append(scroller);
    // if there are no pinned tabs, then set a special CSS class so that the tab curve is valid
    if ($(containerList).find('>li:not(.scroller):not(.nav)').length === 0) {
      scroller.find('ul li:first').addClass('absolute-first');
    }
  };

  shiftTabOffset = function(direction, currentScrollableTabOffset, scroller, nav, opts) {
    var currentTabIndex = getLeftMostTabIndex(scroller, currentScrollableTabOffset),
        scrollerList = scroller.find('ul'),
        scrollMax;

    if (direction < 0) { // move tabs left
      if (currentScrollableTabOffset === 0) {
        // if not yet scrolled, scroll most of a tab left but leave opts.initialTabSlideOffset pixels to show tab has slid under
        currentScrollableTabOffset -= scrollerList.find('li:first').outerWidth() - opts.initialTabSlideOffset;
      } else {
        // shift width of the left most tab
        currentScrollableTabOffset -= scrollerList.find('li:nth-child(' + (currentTabIndex+1) + ')').outerWidth();
      }
      scrollMax = -scroller.find('li:last').position().left + nav.position().left - scroller.position().left - nav.innerWidth() + 8 - opts.initialTabSlideOffset; // 8 shadow
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
  };

  shiftScroller = function(scrollableTabOffset, scroller, outerMostList) {
    var scrollerList = scroller.find('ul');
    scrollerList.css('left', scrollableTabOffset + 'px');
    if (scrollableTabOffset < 0) {
      $(outerMostList).find('li.locked').filter(':last').addClass('overlay'); // show the shadow on first locked tab indicating tabs have slid under
    } else {
      $(outerMostList).find('li.locked').filter(':last').removeClass('overlay'); // remove the shadow on first locked tab indicating tabs have slid under
    }
  };

  // check that navigation is showing if scrolling is needed, fix any other elements dependent upon positions
  adjustToFit = function() {
    if ($(this).is('ul.infinite-tabs')) {
      $(this).data('resetScrollerWidth')();
      $(this).data('positionNavFunction')();
    }
  };

  removeTab = function(tab) {
    if ($(this).is('ul.infinite-tabs')) {
      $(tab).remove();
      adjustToFit.call(this);
    }
  };

  addTab = function(tab, position) {
    if ($(this).is('ul.infinite-tabs')) {
      if (position === 'append') {
        // insert at end before navigation
        $(this).find('li.scroller ul').append(tab);
      } else {
        // insert at start before first non hidden element
        $(this).find('li.scroller ul li:not(.hidden):first').before(tab);
      }
      adjustToFit.call(this);
    }
  };

  setTabContent = function(tab, newTabContent) {
    if ($(this).is('ul.infinite-tabs')) {
      if (typeof newTabContent === 'string') {
        $(tab).find('a').html(newTabContent);
      } else {
        $(tab).find('a').empty().append($(newTabContent));
      }
    }
    adjustToFit.call(this);
  };

  //
  // plugin defaults
  //
  $.fn.infiniteTabs.defaults = {
    initialTabSlideOffset: 10
  };
}(jQuery));