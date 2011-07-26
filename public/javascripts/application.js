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
    if (this.saving) {
      this.saveQueue = this.saveQueue || [];
      this.saveQueue.push({ attrs: _.extend({}, this.attributes, attrs), options: options });
    } else {
      this.saving = true;
      if (!options) { options = {}; }
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
    var actionButton = (title.toLowerCase().indexOf('archive') >= 0 ? 'Archive' : 'Delete');
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
});