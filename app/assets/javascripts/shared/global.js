/*global Backbone:false, $:false, _:false, JST:false, document:false, setTimeout:false, UE:false */

// MVC namespace for Backbone.js
var App = {
    Views: {},
    Collections: {},
    Controllers: {},
    Routers: {}
},
    _ues; // user echo needs to be in global space (urrgghh)

$.ajaxSetup({ dataType: 'json' }); // all AJAX requests to the server are over JSON so lets set this as a default

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
}());

$(document).ready(function() {
  var alertNotice, version, supported;

  // JQuery UI confirm dialog for links with data-confirm for delete actions
  $('a').live('confirm', function(event) {
    var clickedLink, title, actionButton, buttons;

    event.preventDefault();
    event.stopPropagation();
    clickedLink = $(this);
    $('#dialog-confirm').remove();
    title = (clickedLink.attr('title') || (clickedLink.data('vtip-title') || 'Please confirm') );
    $('body').append(JST['templates/layouts/confirm-dialog']({
      title: title,
      confirmationMessage: clickedLink.data('confirm')
    }));
    actionButton = 'Delete';
    buttons = {};
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
      height:160,
      modal: true,
      buttons: buttons
    });
    return (false);
  });

  // Enable the drop down menus for the very top nav
  var topDropdowns = $('#user-account-dropdown, #account-dropdown');
  topDropdowns.on('click', function(e) {
    var dropdown = this,
        alreadyActive = $(dropdown).hasClass('active');

    // align drop down menus with nav
    if ($(this).is('#account-dropdown')) {
      $('#account-dropdown .top-nav-dropdown-overlay').css('left', ($('#account-dropdown').offset().left - 30) + 'px').css('right', '10px').width('auto');
    }

    topDropdowns.removeClass('active'); // remove all other drop downs first
    // toggle drop down menus
    if (alreadyActive) {
      $(dropdown).removeClass('active');
    } else {
      $(dropdown).addClass('active');
    }
    e.preventDefault();
    e.stopPropagation();

    // hide the drop down if clicked anywhere else
    $(document).on('click.user-account', function(e) {
      $(dropdown).removeClass('active');
      $(this).off('click.user-account');
    });
  }).on('click', '.top-nav-dropdown-overlay a', function(e) {
    // allow links in the drop downs to work
    topDropdowns.off('click');
    $(document).off('click.user-account');
    e.stopPropagation();
  });

  // hide notices & alerts after some time
  alertNotice = $('#alert-space .notice, #alert-space .error, #alert-space .warning');
  alertNotice.css('display','none').slideDown(function() {
    _.delay(function() { alertNotice.slideUp(); }, 5000);
  });

  // enable feedback button
  setTimeout(function() {
    $('a.feedback-button').mouseover(function() {
      if (typeof UE !== 'undefined') {
        UE.Popin.preload();
      }
    }).click(function(event) {
      event.preventDefault();
      if (typeof UE !== 'undefined') {
        UE.Popin.show();
      } else {
        document.location.href = '/contact';
      }
    }).fadeIn();
  }, 1500);

  // check that browsers are supported
  version = Number(String($.browser.version).match(/^\d+/)[0]); // strip 6.0.2 down to 6 for example
  $.browser.versionInt = version; // store so we can use elsewhere
  supported = (($.browser.webkit) || ($.browser.mozilla && (version >= 2.0)) || ($.browser.msie && (version >= 9.0)));
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