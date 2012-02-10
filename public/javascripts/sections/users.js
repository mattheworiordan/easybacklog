/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(document).ready(function() {
  function updateUser(id, payLoad, event) {
    // Default JSON-request options.
    var params = {
      url:          document.location.pathname + '/' + id,
      type:         'PUT',
      contentType:  'application/json',
      data:         JSON.stringify(payLoad),
      dataType:     'json',
      processData:  false,
      success:      function(data) {
        $(event.target).parents('tr').find('.progress-icon').hide();
        if (window.console) { console.log('Updated user successfully'); }
      },
      error:        function(jqXHR, textStatus, errorThrown) {
        $(event.target).parents('tr').find('.progress-icon').hide();
        if (window.console) {
          console.log(textStatus);
          console.log(errorThrown);
        }
        new App.Views.Error({ message: 'An internal error occurred. The user\'s permissions could not be updated, please refresh your browser'});
      }
    };

    $(event.target).parents('tr').find('.progress-icon').show();

    $.ajax(params);
  }

  var setPrivilegeState = function(checkbox) {
    var privilegeTd = $(checkbox).parents('tr').find('td.privilege');
    if ($(checkbox).is(":checked")) {
      privilegeTd.find('select').hide();
      privilegeTd.append('<div class="admin-access">Administrator access to all features</div>');
    } else {
      privilegeTd.find('select').show();
      privilegeTd.find('.admin-access').remove();
    }
  };

  // hide checkbox
  $('input.admin:checkbox').hide()
    .after(function() {
      setPrivilegeState(this);
      if ($(this).is(":checked")) {
        return "<a href='#' class='toggle-switch checked' ref='"+$(this).attr("id")+"'></a>";
      } else {
        return "<a href='#' class='toggle-switch' ref='"+$(this).attr("id")+"'></a>";
      }
    });
  $('a.toggle-switch').click(function(event) {
    var checkboxID = $(this).attr("ref"),
        checkbox = $('#'+checkboxID),
        id = $(this).attr('ref').replace('user-',''),
        isAdmin, payLoad;

    event.preventDefault();

    if (checkbox.is(":checked")) {
      checkbox.removeAttr("checked");
      isAdmin = false;
    } else {
      checkbox.attr("checked","true");
      isAdmin = true;
    }
    setPrivilegeState(checkbox);
    $(this).toggleClass("checked");

    payLoad = { id: id, admin: isAdmin };
    updateUser(id, payLoad, event);
  });

  $('select.privilege').change(function(event) {
    var id = $(event.target).attr('id').replace('user-privilege-',''),
        payLoad = { id: id, privilege: $(event.target).val() };

    updateUser(id, payLoad, event);
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