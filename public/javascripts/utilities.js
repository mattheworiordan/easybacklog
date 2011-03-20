// Credit to http://www.mredkj.com/javascript/numberFormat.html
function addCommas(nStr)
{
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
    return jQuery('<div/>').text(value).html();
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