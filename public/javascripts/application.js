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
  });

  // hide notices & alerts after some time
  var alertNotice = $('#alert-space .notice, #alert-space .alert');
  alertNotice.css('display','none').slideDown(function() {
    _.delay(function() { alertNotice.slideUp() }, 5000);
  });
})