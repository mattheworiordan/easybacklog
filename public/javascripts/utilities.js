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