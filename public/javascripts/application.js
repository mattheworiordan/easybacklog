// MVC namespace for Backbone.js
var App = {
    Views: {},
    Collections: {},
    Controllers: {}
};

$(document).ready(function() {
  // JQuery UI confirm dialog for links with data-confirm
  $('a').live('confirm', function() {
    var clicked_link = $(this);
    $('#dialog-confirm').dialog({
      resizable: false,
      height:140,
      modal: true,
      buttons: {
        "Delete": function() {
          clicked_link.attr('data-confirm','').click();
          $(this).dialog("close");
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });
    return (false);
  })
})

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