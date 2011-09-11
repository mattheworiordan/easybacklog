/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(document).ready(function() {
  // standard user rules
  var rules = {
    'backlog[name]': {
      required: true,
      remote: '/accounts/' + $('form#new_backlog').attr('action').match(/^\/accounts\/(\d+)/i)[1] + '/backlogs/name_available'
    },
    'backlog[rate]': {
      required: true,
      number: true,
      min: 0
    },
    'backlog[velocity]': {
      required: true,
      number: true,
      min: 0
    }
  };

  // validate signup form on keyup and submit
  $("form#new_backlog").validate({
    rules: rules,
    messages: {
      'backlog[name]': {
        required: "You must enter a backlog name",
        remote: 'That backlog name is already taken.  Please enter another name'
      }
    },
    // set this class to error-labels to indicate valid fields
    success: function(label) {
      // set &nbsp; as text for IE
      label.html("&nbsp;").addClass("correct");
    }
  });
});