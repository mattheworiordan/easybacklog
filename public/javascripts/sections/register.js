$(document).ready(function() {
  // validation settings if company account being set up at the same time
  if ($('form#user_new input#company_name').length) {
    var rules = {
      'company[name]': {
        required: true,
        remote: '/companies/name_available'
      },
      'company[locale_id]': {
        required: true
      },
      'company[default_rate]': {
        required: true,
        number: true,
        min: 0
      },
      'company[default_velocity]': {
        required: true,
        number: true,
        min: 0
      }
    };
  } else {
    var rules = {}; // don't need to validate anything as not setting up an account now
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
      equalTo: "#user_password"
    }
  });

  // validate signup form on keyup and submit
  $("form#user_new").validate({
    rules: rules,
    messages: {
      'company[name]': {
        required: "You must enter an account name",
        remote: 'An account with this name is already set up.  Please enter another name.'
      },
      'user[name]': {
        required: 'Please enter your full name'
      },
      'user[email]': {
        email: 'Please enter a valid email address',
        remote: 'Someone is already registered with that email address.  <a href="/users/sign_in/">Click here to login now</a>.'
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
});