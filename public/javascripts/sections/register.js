/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(document).ready(function() {
  var rules = {}, // default: don't need to validate anything as not setting up an account now
      frm = $('form#user_new, form#new_account, form.edit_account');

  // validation settings if account being set up at the same time
  if (frm.find('input#account_name').length) {
    rules = {
      'account[name]': {
        required: true,
        remote: '/accounts/name_available' + (frm.find('input#account_name_original').length ? '?except=' + escape(frm.find('input#account_name_original').val()) : '')
      },
      'account[locale_id]': {
        required: true
      }
    };
    // default rate & velocity only available when editing account settings, not setting up account settings
    if (frm.find('input#account_default_rate').length) {
      _.extend(rules, {
        'account[default_rate]': {
          number: true,
          min: 0
        },
        'account[default_velocity]': {
          number: true,
          min: 0
        }
      });
    }
  }

  // standard user rules
  _.extend(rules, {
    'user[name]': 'required',
    'user[email]': {
      required: true,
      email: true,
      remote: '/users/email_available'
    },
    'user[password]': {
      required: true,
      minlength: 6
    },
    'user[password_confirmation]': {
      required: true,
      equalTo: "#user_password"
    }
  });

  // validate signup form on keyup and submit
  frm.validate({
    rules: rules,
    messages: {
      'account[name]': {
        required: "You must enter an account name",
        remote: 'An account with this name is already set up.  Please enter another name.'
      },
      'user[name]': {
        required: 'Please enter your full name'
      },
      'user[email]': {
        email: 'Please enter a valid email address',
        remote: 'Someone is already registered with that email address.  <a href="/users/sign_in/">Login now</a>.'
      },
      'user[password_confirmation]': {
        equalTo: 'The password confirmation is not the same as the password entered'
      }
    },
    // set this class to error-labels to indicate valid fields
    success: function(label) {
      // set &nbsp; as text for IE
      label.html("&nbsp;").addClass("correct");
    }
  });

  frm.submit(function() {
    if (frm.valid()) {
      $(window).scrollTop(1000000); // ensure we're at the bottom so user can see the notice
      $('form#user_new input#user_submit, form#new_account input#account_submit').addClass('greyed').attr('disabled','true').val('Preparing your account...');
      $('.waiting').slideDown();
    }
  })
});