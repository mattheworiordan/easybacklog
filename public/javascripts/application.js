// MVC namespace for Backbone.js
var App = {
    Views: {},
    Collections: {},
    Controllers: {}
};

$(document).ready(function() {
  // JQuery UI confirm dialog for links with data-confirm for delete actions
  $('a').live('confirm', function() {
    event.preventDefault();
    var clicked_link = $(this);
    $('#dialog-confirm').remove();
    $('body').append(JST['layouts/confirm-dialog']({
      title: (clicked_link.attr('title') ? clicked_link.attr('title') : 'Please confirm'),
      confirmationMessage: clicked_link.data('confirm')
    }));
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
  var alertNotice = $('#alert-space .notice, #alert-space .error, #alert-space .warning');
  alertNotice.css('display','none').slideDown(function() {
    _.delay(function() { alertNotice.slideUp() }, 5000);
  });
})