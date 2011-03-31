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
    var title = (clickedLink.attr('title') ? clickedLink.attr('title') :
      (clickedLink.data('vtip-title') ? clickedLink.data('vtip-title') : 'Please confirm') );
    $('body').append(JST['layouts/confirm-dialog']({
      title: title,
      confirmationMessage: clickedLink.data('confirm')
    }));
    var actionButton = (title.toLowerCase().indexOf('archive') >= 0 ? 'Archive' : 'Delete');
    var buttons = {}
    buttons[actionButton] = function() {
      clickedLink.data('confirm','');
      clickedLink.click();
      $(this).dialog("close");
    }
    buttons['Cancel'] = function() {
      $(this).dialog("close");
    }
    $('#dialog-confirm').dialog({
      resizable: false,
      height:140,
      modal: true,
      buttons: buttons
    });
    return (false);
  });

  // hide notices & alerts after some time
  var alertNotice = $('#alert-space .notice, #alert-space .error, #alert-space .warning');
  alertNotice.css('display','none').slideDown(function() {
    _.delay(function() { alertNotice.slideUp() }, 5000);
  });
})