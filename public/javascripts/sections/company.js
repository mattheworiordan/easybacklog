/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(function() {
  var frm = $('form#new_company, form.edit_company');

  frm.validate({
    rules: {
        'company[default_rate]': {
        number: true,
        min: 0
      },
      'company[default_velocity]': {
        number: true,
        min: 0
      },
      'company[name]': {
        required: true,
        remote: document.location.href.match(/\/accounts\/\d+\/companies/) + '/name_available' + (frm.find('input#company_name_original').length ? '?except=' + escape(frm.find('input#company_name_original').val()) : '')
      }
    },
    messages: {
      'company[name]': {
        required: "You must enter a company name",
        remote: 'A company with this name is already set up.  Please enter another name.'
      }
    },
    // set this class to error-labels to indicate valid fields
    success: function(label) {
      // set &nbsp; as text for IE
      label.html("&nbsp;").addClass("correct");
    }
  });

  // set up backlog settings, if not editing the backlog, then default to show points if no preference yet exists
  App.Views.Shared.EnableBacklogEstimationPreferences(frm, 'company');
});