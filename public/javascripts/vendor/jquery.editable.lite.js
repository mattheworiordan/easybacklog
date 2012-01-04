/*global window:false, setTimeout:false, jQuery:false, getComputedStyle:false */ // JSLint
/*jslint unparam: true, white: true, maxerr: 50, indent: 2 */

/*
 * JQuery Editable Lite
 * Repository: https://github.com/mattheworiordan/jquery.editable.lite.js
 * Author: http://mattheworiordan.com
 *
 * Inspired by JQuery JEditable http://www.appelsiini.net/projects/jeditable
 *
 * Overview:
 * I found JEditable to be way too heavy so I created a near compatible API version
 * of JEditable, yet this version is tiny
 *
 * Dependencies:
 * - Optional: jquery.textarea-expander.js by Craig Buckler, Optimalworks.net
 *  ( this is only required if you use the autoResize option )
 *  ( jquery.textarea-expender.js is included in this source )
 *
 * options are:
 * - type: 'text', // text or textarea
 * - maxLength: false, // set maxlength of an input text field
 * - acceptChangesOnBlur: true, // if this is false, changes are discarded when input loses focus
 * - autoResize: false, // allows auto resize of text areas if jquery.textarea-expander.js is included (in vendor/js folder)
 * - autoResizeMax: 300, // set max height autoResize field can expand to,
 * - noChange: false, // callback that will be made even if no change was made to the input field, by default no call is made
 * - placeHolder: false, // allows HTML to be placed inside the target when empty such as [click here to edit]
 * - autoComplete: false // allows use of JQuery UI autoComplete plugin, pass in an array or function to return an array of data
 * - data: false, // callback allowing data to be passed to this plugin on edit instead of using the content from the target
 * - offsetX: 0, // move textarea X pixels from calculated position
 * - offsetY: 0, // move textarea Y pixels from calculated position
 * - assumedBorderWidth: 4, // border width of input field allowed for in width calculations
 * - displayDelay: 50 // optional delay before displaying the text field, sometimes useful if GUI is changing just as user clicks on editable field
 * - zIndex: 10000 // zIndex for the input, defaults to a ridiculously high number
 * - widen: 5 // widens the editable field by an additional X pixels
 *
 * Command usage example:
 *   $('div').editable(valueChangedCallback);
 *   $('div').editable(valueChangedCallback, options); // option is a Javascript object such as { autoComplete: true }
 */

(function ($) {
  "use strict";

  var initialize, elementCurrentStyle, htmlEncode, multiLineHtmlEncode, multiLineHtmlDecode;

  $.fn.editable = function(command, options) {
    var opts;

    if ( (typeof command === 'function') || !command ) {
      // build main options before element iteration
      opts = $.extend({}, $.fn.editable.defaults);
      if (typeof options === 'object') {
        opts = $.extend(opts, options);
      }
      opts.changeCallback = command;

      // iterate and initialize matched element
      return this.each(function() {
        initialize.call(this, opts);
      });
    }
  };

  initialize = function(options) {
    var target = this,
        form, elem, targetProps = {},
        showEditableField, editableFieldFactory, restoreTarget, saveChanges,
        addPlaceHolderIfEmpty, stripPlaceHolder;

    /*
     * Functions
     */

    showEditableField = function(evt) {
      var getBackgroundColor, positioningSpan, offsetBy, inputText,
          eventAlreadyProcessed = false; // multiple keydown events are sometimes fired, ensure we only deal with the first valid one

      stripPlaceHolder();

      // store attributes from target before we modify it
      targetProps.style = $(target).attr('style');
      targetProps.text = multiLineHtmlDecode($(target).html()); // convert HTML br tags to line breaks
      targetProps.height = $(target).outerHeight();
      inputText = targetProps.text;

      // if data callback exists then get the value for this field from that callback
      if (typeof options.data === 'function') {
        inputText = options.data.call(target, targetProps.text, target);
      } else if (typeof options.data === 'string') {
        inputText = options.data;
      }

      form = $('<form class="editable-lite-form">');
      elem = editableFieldFactory(options.type, target); // get the text type field based on the options passed in

      // now set font characteristics
      elem.css('font-size', elementCurrentStyle(target, 'font-size'));
      elem.css('font-family', elementCurrentStyle(target, 'font-family'));
      elem.css('color', elementCurrentStyle(target, 'color'));

      // determine background color from target or any of its parents
      getBackgroundColor = function(node) {
        var backgroundColor = elementCurrentStyle(node, 'background-color');
        if (!backgroundColor || backgroundColor === 'transparent' || backgroundColor === 'inherit') {
          if ($(node).parent().length) {
            getBackgroundColor($(node).parent()[0]);
          } else {
            return backgroundColor;
          }
        }
      };
      elem.css('background-color', getBackgroundColor(target));

      // insert a span into the actual element to see where the text starts
      // in instances where a DIV has a preceeding div with float, the text could be
      // offset
      positioningSpan = $('<span>&nbsp;</span>');
      $(target).prepend(positioningSpan);

      form.css('position','absolute')
        .css('margin', '0').css('padding', '0')
        .css('top', options.offsetY + $(target).position().top + 'px')
        .css('left', options.offsetY + $(positioningSpan).position().left + 'px')
        .css('z-index', options.zIndex)
        .append(elem);

      // calculate offset of positionSpan to left hand side of node so we can reduce the width of the editable text field
      offsetBy = $(positioningSpan).position().left - $(target).position().left;

      // ensure input element has not additional padding inherited and set width
      elem.css('padding',0).css('margin',0)
        .css('width', ($(target).outerWidth() - options.assumedBorderWidth - offsetBy + (options.widen ? options.widen : 0)) + 'px'); // less 4 pixels to allow for border

      positioningSpan.remove();

      // set the value of the element to the text in the div
      elem.val(inputText);

      // now empty the node as the text sometimes appears beneath the textarea / text field
      $(target).css('height', $(target).height() + 'px').text('');

      $(target).append(form); // add the form inside this element
      setTimeout(function() { // wait for browser to render
        targetProps.inputHeight = $(elem).height(); // store the textarea height in case it expands
      }, 1);

      $(elem).focus();

      // add event handler to fire if user moves away
      $(elem).blur(function(event) {
        if (!eventAlreadyProcessed) { // if blurring as a result of a key press, then allow this blur event to be ignored
          eventAlreadyProcessed = true;
          if (options.acceptChangesOnBlur) {
            saveChanges();
          } else {
            restoreTarget();
          }
          $(elem).unbind('blur');
        }
      });

      // if user clicks anywhere outside this elem then assume this is effectively a blur
      setTimeout(function() {
        $('html').bind('click.editable', function() {
          $(elem).trigger('blur');
        });
      }, 1);

      // if user clicks inside the element, prevent propagation and thus blurring from binding above
      $(elem).click(function(event) {
        event.stopPropagation();
      });

      // add event handler to fire if user presses any "special key"
      $(elem).keydown(function(event) {
        if (!eventAlreadyProcessed) {
          if (event.which === 13) { // enter, save changes and move on
            if ( (options.type === 'textarea') && (event.ctrlKey || event.altKey || event.shiftKey) ) {
              // allow line breaks in text areas
              event.stopPropagation();
            } else {
              eventAlreadyProcessed = true;
              saveChanges();
            }
          } else if (event.which === 27) { // escape key
            eventAlreadyProcessed = true;
            restoreTarget();
          } else if (event.which === 9) { // tab
            eventAlreadyProcessed = true;
            saveChanges();
          }
        }
        if (!eventAlreadyProcessed && (options.type === 'textarea') && (options.autoResize)) {
          if ($(elem).height() > targetProps.inputHeight) {
            // textarea has expanded vertically
            // in Firefox the textarea is cropped to the parent element, so we need to expand the parent element to allow for the expanded textarea
            $(target).css('height', (targetProps.height + $(elem).height() - targetProps.inputHeight + 10) + 'px');
          }
        }
      });
    };

    editableFieldFactory = function(type, target) {
      var elem;
      if (type === 'textarea') {
        elem = $('<textarea name="value"></textarea>');
        if (options.autoResize) {
          elem.TextAreaExpander(false, options.autoResizeMax);
        } else {
          elem.css('height', $(target).height() + "px");
        }
      } else {
        elem = $('<input type="text" name="value">');
        if (options.maxLength) { elem.attr('maxlength', options.maxLength); }
        if (options.autoComplete) {
          elem.attr('autocomplete','off');
          elem.autocomplete({
            source: ($.isArray(options.autoComplete) ? options.autoComplete : options.autoComplete()),
            minLength: 0,
            delay: 0
          });
        }
      }
      return elem;
    };

    // set target back to it's original state
    // optionally take a parameter for new text
    restoreTarget = function(newVal) {
      var val = typeof newVal !== 'undefined' ? newVal : targetProps.text,
          encodedVal = multiLineHtmlEncode(val);

      // wait a split second to ensure all events propogate down to the form element in case other code has bound to the editable element
      setTimeout(function() {
        // save value to target HTML element, but keep form visible so append to the HTML
        $(target).attr('style', targetProps.style || '').html(encodedVal).append(form);
        // restore height as it may be changed as textarea expands vertically
        // if ((options.type === 'textarea') && (options.autoResize)) { $(target).css('height', ''); }
        $(target).data('editable-active', false);

        // pause before we remove the element as other events may need to access this element before it disappears
        setTimeout(function() {
          form.hide().remove();
          $(target).find('form.editable-lite-form').remove(); // odd bug where a blank form was appearing, had to manually remove any forms matching the class
          addPlaceHolderIfEmpty();
        }, 20);

        // if user wants a callback even if there was no change, then call this now
        if ((typeof newVal === 'undefined') && (typeof options.noChange === 'function')) {
          options.noChange.call(target, val);
        }

        // remove catch all event to see if user clicked outside this elem
        $('html').unbind('click.editable');
      }, 1);
    };

    saveChanges = function() {
      var returnVal;
      if (elem.val() !== targetProps.text) {
        returnVal = options.changeCallback.call(target, elem.val(), target);
        // if callback returned a value, then use this instead of the value from the text field
        if (returnVal) {
          restoreTarget(returnVal);
        } else {
          restoreTarget(elem.val());
        }
      } else {
        restoreTarget();
      }
    };

    addPlaceHolderIfEmpty = function() {
      if (options.placeHolder && ($(target).html().replace(/\s+/g,'') === '')) {
        $(target).html(options.placeHolder);
      }
    };

    stripPlaceHolder = function() {
      if (options.placeHolder && ($(target).html() === options.placeHolder) ) {
        $(target).html('');
      }
    };

    /*
     * Execution starts here
     */

    // assign event handler
    $(this).click(function(e) {
      if ($(target).data('editable-active') !== 'true') {
        // record a flag to see we're editing, no need to try and recreate this
        $(target).data('editable-active', 'true');

        if (options.displayDelay) {
          setTimeout(function() {
            showEditableField();
          }, options.displayDelay);
        } else {
          showEditableField();
        }
      }
    });

    // show the place holder if necessary
    addPlaceHolderIfEmpty();
  };

  /*
   * Global utility functions needing no scope
   */

  elementCurrentStyle = function(element, styleName){
    if (element.currentStyle){
      var i = 0, temp = "", changeCase = false;
      for (i = 0; i < styleName.length; i = i + 1) {
        if (styleName[i] !== '-'){
            temp += (changeCase ? styleName[i].toUpperCase() : styleName[i]);
            changeCase = false;
        } else {
            changeCase = true;
        }
      }
      styleName = temp;
      return element.currentStyle[styleName];
    } else {
      return getComputedStyle(element, null).getPropertyValue(styleName);
    }
  };

  htmlEncode = function(value){
    if (value) {
      return $('<span/>').text(value).html();
    } else {
      return '';
    }
  };

  multiLineHtmlEncode = function(value) {
    var lines, i;
    if (typeof value === 'string') {
      lines = value.split(/\r\n|\r|\n/);
      for (i = 0; i < lines.length; i = i+1) {
        lines[i] = htmlEncode(lines[i]);
      }
      return lines.join('<br/>');
    } else {
      return '';
    }
  };

  multiLineHtmlDecode = function(html) {
    html = html.split(/<br\s*\/?\s*>/);
    html = $.map(html, function(htmlFragment) { return $('<span/>').html(htmlFragment).text(); }).join('\n');
    return html;
  };
  //
  // plugin defaults
  //
  $.fn.editable.defaults = {
    type: 'text', // text or textarea
    offsetX: 0, // move textarea X pixels
    offsetY: 0, // move textarea Y pixels
    assumedBorderWidth: 4, // border width of input field allowed for in width calculations
    acceptChangesOnBlur: true, // if this is false, changes are discarded when input loses focus
    data: false, // callback allowing data to be passed to this plugin instead of using the content from the target
    maxLength: false, // set maxlength of an input field
    autoResize: false, // allows auto resize of text areas if jquery.textarea-expander.js is included
    autoResizeMax: 300, // set max height autoResize field can expand to,
    noChange: false, // callback that will be made even if no change was made to the input field, by default no call is made
    placeHolder: false, // allows HTML to be placed inside the target when empty such as [click here to edit]
    autoComplete: false, // allows use of JQuery UI autoComplete plugin, pass in an array or function to return an array of data
    zIndex: 10000 // zIndex for the input, defaults to a ridiculously high number
  };
}(jQuery));