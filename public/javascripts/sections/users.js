/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(document).ready(function() {
  $('input.admin:checkbox').change(function(event) {
    var id = $(event.target).attr('id').replace('user-','');
    var isAdmin;
    if ($(event.target).is(':checked')) {
      $('label#label-user-' + id).text('Yes');
      isAdmin = true;
    } else {
      $('label#label-user-' + id).text('No');
      isAdmin = false;
    }
    var payLoad = { id: id, admin: isAdmin };

    // Default JSON-request options.
    var params = {
      url:          document.location.pathname + '/' + id,
      type:         'PUT',
      contentType:  'application/json',
      data:         JSON.stringify(payLoad),
      dataType:     'json',
      processData:  false,
      success:      function(data) { if (window.console) { console.log('Updated user successfully'); } },
      error:        function(jqXHR, textStatus, errorThrown) {
        if (window.console) { console.log(textStatus); }
        if (window.console) { console.log(errorThrown); }
        var errorView = new App.Views.Error({ message: 'The user could not be updated, please refresh your browser'});
      }
    };

    $.ajax(params);
  });

  var textareaText = 'Enter each email address here separated by commas';
  $('#new-user textarea#emails').blur(function(event) {
    var text = $(event.target);
    if ($.trim(text.val()) === '') {
      text.val(textareaText).addClass('empty');
    }
  }).focus(function(event) {
    var text = $(event.target);
    if (text.val() === textareaText) {
      text.val('').removeClass('empty');
    }
  }).blur();

  $('#new-user form').submit(function(event) {
    var text = $(event.target).find('textarea#emails');
    if ((text.val() === textareaText) || ('' === $.trim(text.val()))) {
      event.preventDefault();
      if (!$(event.target).has('.form_errors')) {
        $(event.target).prepend('<div class="form_errors">');
      }
      var msg = 'We need you to enter one or more email addresses in the text area so that we can send our the invites.' +
        'Please correct this to continue';
      $(event.target).find('.form_errors').text(msg);
      text.wrap('<div class="field_with_errors">');
    }
  });
});