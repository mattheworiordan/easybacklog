/*global Backbone:false, $:false, _:false, JST:false */

// MVC namespace for Backbone.js
var App = {
    Views: {},
    Collections: {},
    Controllers: {}
};

// Patch for Backbone to ensure save is completed before more requests are sent to the server
// http://stackoverflow.com/questions/5886748/backbone-js-problem-when-saving-a-model-before-previous-save-issues-postcreate
(function() {
  function proxyAjaxEvent(event, options, dit) {
    var eventCallback = options[event];
    options[event] = function() {
      // check if callback for event exists and if so pass on request
      if (eventCallback) { eventCallback.apply(options, arguments); }
      dit.processQueue(); // move onto next save request in the queue
    };
  }
  Backbone.Model.prototype._save = Backbone.Model.prototype.save;
  Backbone.Model.prototype.save = function( attrs, options ) {
    if (!options) { options = {}; }
    if (this.saving) {
      this.saveQueue = this.saveQueue || [];
      this.saveQueue.push({ attrs: _.extend({}, this.attributes, attrs), options: options });
    } else {
      this.saving = true;
      proxyAjaxEvent('success', options, this);
      proxyAjaxEvent('error', options, this);
      Backbone.Model.prototype._save.call(this, attrs, options);
    }
  };
  Backbone.Model.prototype.processQueue = function() {
    if (this.saveQueue && this.saveQueue.length) {
      var saveArgs = this.saveQueue.shift();
      proxyAjaxEvent('success', saveArgs.options, this);
      proxyAjaxEvent('error', saveArgs.options, this);
      Backbone.Model.prototype._save.call(this, saveArgs.attrs, saveArgs.options);
    } else {
      this.saving = false;
    }
  };
})();

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
    var actionButton = 'Delete';
    var buttons = {};
    buttons[actionButton] = function() {
      clickedLink.data('confirm','');
      clickedLink.click();
      $(this).dialog("close");
    };
    buttons.Cancel = function() {
      $(this).dialog("close");
    };
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
    _.delay(function() { alertNotice.slideUp(); }, 5000);
  });

  // check that browsers are supported
  var supported = (($.browser.webkit) || ($.browser.mozilla && ($.browser.version >= 2)) || ($.browser.msie && ($.browser.version >= 9)));
  if (!supported) {
    $('.unsupported_browser .hide_notice a').click(function(event) {
      event.preventDefault();
      $.cookie('hide_unsupported_browser_notice', 'true', { expires: 30 });
      $('.unsupported_browser').slideUp();
    });
    if ($.cookie('hide_unsupported_browser_notice') !== 'true') {
      $('.unsupported_browser').show();
    }
  }
});