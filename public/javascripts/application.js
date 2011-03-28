// MVC namespace for Backbone.js
var App = {
    Views: {},
    Collections: {},
    Controllers: {}
};

$(document).ready(function() {
  // JQuery UI confirm dialog for links with data-confirm for delete actions
  $('a').live('confirm', function(event) {
    event.preventDefault();
    event.stopPropagation();
    var clickedLink = $(this);
    $('#dialog-confirm').remove();
    $('body').append(JST['layouts/confirm-dialog']({
      title: (clickedLink.attr('title') ? clickedLink.attr('title') : 'Please confirm'),
      confirmationMessage: clickedLink.data('confirm')
    }));
    $('#dialog-confirm').dialog({
      resizable: false,
      height:140,
      modal: true,
      buttons: {
        "Delete": function() {
          clickedLink.data('confirm','');
          clickedLink.click();
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