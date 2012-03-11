/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

// Credit to http://www.mredkj.com/javascript/numberFormat.html
function addCommas(nStr)
{
  var x, x1, x2;
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

// credit to http://stackoverflow.com/questions/1219860/javascript-jquery-html-encoding
function htmlEncode(value){
  if (value) {
    return $('<span/>').text(value).html();
  } else {
    return '';
  }
}

function multiLineHtmlEncode(value) {
  if (_.isString(value)) {
    var lines = value.split(/\r\n|\r|\n/);
    for (var i = 0; i < lines.length; i++) {
      lines[i] = htmlEncode(lines[i]);
    }
    return lines.join('<br/>');
  } else {
    return '';
  }
}

function htmlDecodeWithLineBreaks(html) {
  var breakToken = '_______break_______',
      lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken).replace(/<p\.*?>(.*?)<\/p>/gi, '$1' + breakToken);
  return $('<div>').html(lineBreakedHtml).text().replace(new RegExp(breakToken, 'g'), '\n');
}

function urlify(value, maxLength) {
  var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
  return value.replace(urlRegEx, function(match) {
    var url = $('<div>').html(match).text(); // HTML decode the encoded URL
    if (maxLength && (url.length > maxLength)) {
      url = url.substring(0,maxLength) + '…'
    }
    var link = $('<a class="urlified">').attr('href', match).text(url);
    return $('<div>').append(link).html();
  })
}

function unUrlify(target) {
  $(target).find('a.urlified').each(function(index, node) {
    var href = $('<div>').html($(node).attr('href')).text(); // HTML decode the HREF
    $(node).replaceWith($('<span>').text(href));
  });
}

// lose the trailing .0
function niceNum(value) {
  if (value) {
    return String(value).replace(/\.0+$/, '');
  } else {
    return value;
  }
}

function parseRubyDate(value) {
  var dateParts = String(value).split('-'); // yyyy-mm-dd
  return new Date(dateParts[0], Number(dateParts[1])-1, dateParts[2]);
}

// deep look at whether two set of DOM elements have the same values
//  assumes two are clones of each other and have unique IDs for all form elements
function haveFormElementValuesChanged(dom1, dom2) {
  var same = false;
  $(dom1).find('input[type=text],input[type=password],select').each(function(i, elem) {
    if ($(dom2).find('#' + $(elem).attr('id')).val() !== $(elem).val()) {
      same = true;
    }
  });
  $(dom1).find('input[type=checkbox],input[type=radio]').each(function(i, elem) {
    if ($(dom2).find('#' + $(elem).attr('id')).is(':checked') !== $(elem).is(':checked')) {
      same = true;
    }
  });
  return same;
}

// keeps track of recent mouse position and provides functionality to check if mouse is over an object
// useful for when nodes appear underneath the mouse without mouse movement and we need to trigger hover
// see http://stackoverflow.com/questions/4403518
function MouseTracker($) {
  var mouseX, mouseY;

  $(document).mousemove(function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  return {
    isOver: function(node) {
      var p = $(node).offset();
      if (mouseX >= p.left && mouseX <= p.left + $(node).width()
         && mouseY >= p.top && mouseY <= p.top + $(node).height())
      {
        return true;
      }
      return false;
    }
  }
}

var I18n = (function() {
  return {
    t: function(value, defaultValue) {
      if (this[value]) {
        return this[value];
      } else {
        return defaultValue;
      }
    },
    add: function(localizations) {
      _(this).extend(localizations);
    }
  }
})();